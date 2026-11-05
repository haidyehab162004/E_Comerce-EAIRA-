// ملف api.js - مسؤول عن جميع الاتصالات مع السيرفر الخلفي (Backend)

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const API_BASE = new URL(API_URL).origin;

// Helper: بناء URL كامل للصور المرفوعة
// لو الصورة مسار نسبي (/uploads/...) نضيف عليه رابط السيرفر
// لو الصورة رابط كامل (http://...) نرجعها زي ما هي
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // رابط خارجي (Unsplash مثلاً)
  return `${API_BASE}${path}`; // مسار نسبي → رابط كامل
};

const buildUrl = (path, params) => {
  const url = new URL(path.replace(/^\/+/, ''), `${API_URL}/`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else url.searchParams.set(key, value);
  });
  return url;
};

const request = async (method, path, { params, data, headers: extraHeaders } = {}) => {
  const url = buildUrl(path, params);
  const headers = new Headers(extraHeaders);
  const currentToken = localStorage.getItem('token');
  const adminToken = localStorage.getItem('tokenAdmin');
  const isAdminRequest = path.startsWith('/admin');
  const token = isAdminRequest && adminToken === currentToken ? adminToken : currentToken;
  const hasAuthorization = Boolean(token);

  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body;
  if (data instanceof FormData) {
    headers.delete('Content-Type');
    body = data;
  } else if (data !== undefined) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    body = JSON.stringify(data);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { method, headers, body, signal: controller.signal });
    const contentType = response.headers.get('content-type') || '';
    const responseData = response.status === 204
      ? null
      : contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      const errorMessage = responseData?.message || `Request failed with status code ${response.status}`;

      if (response.status === 401 && hasAuthorization) {
        ['token', 'tokenAdmin', 'name', 'userId'].forEach((key) => localStorage.removeItem(key));
        if (!window.location.pathname.includes('/login')) window.location.href = '/login';
      }

      console.error(`[API Error] ${method} ${path}:`, responseData);
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Request timed out after 15000ms', { cause: error });
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

const axiosInstance = {
  get: (path, config) => request('GET', path, config),
  post: (path, data, config) => request('POST', path, { ...config, data }),
  put: (path, data, config) => request('PUT', path, { ...config, data }),
  delete: (path, config) => request('DELETE', path, config),
};

// 1. نظام الحسابات (Authentication)
export const authApi = {
  // تسجيل مستخدم جديد - البيانات المطلوبة: name, email, password, phone, address
  register: (userData) => axiosInstance.post('/auth/register', userData),

  // تسجيل الدخول - البيانات المطلوبة: email, password
  login: (credentials) => axiosInstance.post('/auth/login', credentials),

  // جلب بيانات المستخدم الحالي (يحتاج توكن)
  getMe: () => axiosInstance.get('/auth/me'),

  // تحديث الملف الشخصي - البيانات: name, phone, address, avatar
  updateMe: (userData) => axiosInstance.put('/auth/me', userData),

  // تغيير كلمة المرور - البيانات: currentPassword, newPassword
  changePassword: (passwords) => axiosInstance.put('/auth/change-password', passwords),
};

// 2. المتجر والمنتجات (Store / Products)
export const storeApi = {
  // جلب المنتجات مع الفلترة - query params: category, q, priceMin, priceMax, sort, inStock
  getProducts: (params = {}) => axiosInstance.get('/store/products', { params }),

  // تفاصيل منتج معين باستخدام الـ ID
  getProductById: (id) => axiosInstance.get(`/store/products/${id}`),

  // المنتجات المميزة للصفحة الرئيسية
  getFeaturedProducts: () => axiosInstance.get('/store/products/featured'),

  // أحدث المنتجات المتاحة بالمخزون
  getNewArrivals: (params = {}) => axiosInstance.get('/store/products/new-arrivals', { params }),

  // المنتجات المتاحة في التخفيضات
  getSaleProducts: (params = {}) => axiosInstance.get('/store/products/sale', { params }),

  // قائمة الفئات وعدد المنتجات
  getCategories: () => axiosInstance.get('/store/categories'),
};

// 3. الطلبات (Orders)
export const ordersApi = {
  // إنشاء طلب جديد
  // البيانات: customer{name,email,phone,address}, items[{product,quantity,size,color,price}]
  // subtotal, shippingCost, totalAmount, paymentMethod, notes
  createOrder: (orderData) => axiosInstance.post('/orders', orderData),

  // سجل طلبات المستخدم الحالي (يحتاج توكن)
  getMyHistory: () => axiosInstance.get('/orders/my/history'),

  // تتبع طلب معين بالـ ID
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
  cancelOrder: (id) => axiosInstance.put(`/orders/${id}/cancel`),
};

// 4. لوحة تحكم الأدمن (Admin) - جميعها تحتاج tokenAdmin
export const adminApi = {
  // إحصائيات لوحة التحكم (revenue, ordersCount, productsCount, customersCount)
  getDashboard: () => axiosInstance.get('/admin/dashboard'),

  // رفع صورة منتج - ترسل الملف كـ FormData وترجع { url }
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // جلب جميع المنتجات
  getProducts: () => axiosInstance.get('/admin/products'),

  // إضافة أو تعديل منتج
  // البيانات: name, price, category, description, image, images, sizes, colors, stockCount, isNewProduct, isSale, isFeatured
  saveProduct: (id, productData) =>
    id
      ? axiosInstance.put(`/admin/products/${id}`, productData)
      : axiosInstance.post('/admin/products', productData),
      
  // حذف منتج
  deleteProduct: (id) => axiosInstance.delete(`/admin/products/${id}`),

  // جلب جميع المستخدمين
  getUsers: () => axiosInstance.get('/admin/users'),

  // تعديل بيانات مستخدم - البيانات: isActive, isAdmin, name, phone, address
  updateUser: (id, userData) => axiosInstance.put(`/admin/users/${id}`, userData),

  // حذف مستخدم
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),

  // جلب جميع الطلبات
  getOrders: (params = {}) => axiosInstance.get('/admin/orders', { params }),

  // تغيير حالة الطلب - البيانات: status, isPaid
  updateOrder: (id, statusData) => axiosInstance.put(`/admin/orders/${id}`, statusData),
};

// 5. تقييمات المنتجات
export const reviewsApi = {
  // أحدث التقييمات في المتجر (الصفحة الرئيسية)
  getLatestReviews: (params = {}) => axiosInstance.get('/reviews/latest', { params }),

  getProductReviews: (productId, params = {}) =>
    axiosInstance.get(`/reviews/product/${productId}`, { params }),

  getMyProductReview: (productId) =>
    axiosInstance.get(`/reviews/product/${productId}/mine`),

  addProductReview: (productId, reviewData) =>
    axiosInstance.post(`/reviews/product/${productId}`, reviewData),

  // تعديل تعليق (صاحب التعليق فقط)
  // البيانات: { rating?, comment?, title? }
  updateReview: (reviewId, reviewData) =>
    axiosInstance.put(`/reviews/${reviewId}`, reviewData),

  // حذف تعليق (صاحب التعليق أو الأدمن)
  deleteReview: (reviewId) =>
    axiosInstance.delete(`/reviews/${reviewId}`),

};

// 6. قائمة الأمنيات (Wishlist) — تُخزَّن في الداتابيز مرتبطة بالتوكن
export const wishlistApi = {
  // جلب القائمة الكاملة مع بيانات المنتجات
  // الاستجابة: { wishlist: [Product] }
  getWishlist: () => axiosInstance.get('/wishlist'),

  // إضافة أو إزالة منتج (Toggle)
  // الاستجابة: { wishlist: [ids], added: boolean }
  toggleItem: (productId) => axiosInstance.post(`/wishlist/toggle/${productId}`),

  // إزالة منتج معين
  removeItem: (productId) => axiosInstance.delete(`/wishlist/${productId}`),

  // مسح القائمة بالكامل
  clearAll: () => axiosInstance.delete('/wishlist'),
};

// 7. سلة التسوق (Cart) — تُخزَّن في الداتابيز مرتبطة بالتوكن
export const cartApi = {
  // جلب السلة
  getCart: () => axiosInstance.get('/cart'),

  // إضافة للسلة
  addToCart: (productId, quantity, size, color) => 
    axiosInstance.post('/cart', { productId, quantity, size, color }),

  // تعديل كمية
  updateQuantity: (itemId, quantity) => 
    axiosInstance.put(`/cart/${itemId}`, { quantity }),

  // إزالة منتج
  removeFromCart: (itemId) => axiosInstance.delete(`/cart/${itemId}`),

  // تفريغ السلة بالكامل
  clearCart: () => axiosInstance.delete('/cart'),
};
