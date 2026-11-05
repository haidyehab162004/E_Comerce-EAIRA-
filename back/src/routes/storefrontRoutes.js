const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { escapeRegex, getPagination } = require('../utils/query');

/**
 * ========================================================
 * Storefront Routes - /api/store
 * ========================================================
 * هذه المسارات للواجهة الأمامية (العميل العادي)
 * لا تحتاج توثيق (Public)
 * ========================================================
 */

/**
 * @route   GET /api/store/products
 * @desc    جلب المنتجات مع الفلترة والبحث والترتيب
 * @access  Public
 * @query   category   - فلترة حسب الفئة (men, women, accessories, outerwear, footwear)
 * @query   subcategory - فلترة حسب الفئة الفرعية
 * @query   q          - بحث نصي في الاسم
 * @query   priceMin   - أقل سعر
 * @query   priceMax   - أعلى سعر
 * @query   sort       - الترتيب: newest | price_asc | price_desc | rating
 * @query   inStock    - فقط المتوفر في المخزون (true/false)
 * @query   page       - رقم الصفحة (pagination) - افتراضي 1
 * @query   limit      - عدد المنتجات في الصفحة - افتراضي 12
 * @returns { products, total, page, pages }
 */
router.get('/products', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      size,
      color,
      q,
      priceMin,
      priceMax,
      sort,
      inStock,
      page = 1,
      limit = 12
    } = req.query;

    // بناء فلتر البحث
    // الافتراضي: كل المنتجات (حتى اللي مخزونها صفر) عشان أي منتج جديد يظهر في المتجر
    // inStock=true فقط هي اللي بتحصر النتائج في المتوفر
    const filter = inStock === 'true' ? { inStock: true, stockCount: { $gt: 0 } } : {};

    if (category) {
      if (category.toLowerCase() === 'new') {
        filter.isNewProduct = true;
      } else {
        filter.category = category.toLowerCase();
      }
    }
    if (subcategory) filter.subcategory = subcategory.toLowerCase();
    if (size) filter.sizes = size; // المنتج يحتوي على هذا المقاس في مصفوفة sizes
    if (color) filter.colors = color; // المنتج يحتوي على هذا اللون في مصفوفة colors
    if (typeof q === 'string' && q.trim()) filter.name = { $regex: escapeRegex(q), $options: 'i' };

    // فلترة السعر
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    // تحديد طريقة الترتيب
    // الافتراضي و«الأحدث»: المنتجات الجديدة الأول، وبعدها المتوفر، ثم الأحدث إضافة.
    let sortOption = { isNewProduct: -1, inStock: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1, inStock: -1 };
    else if (sort === 'price_desc') sortOption = { price: -1, inStock: -1 };
    else if (sort === 'rating') sortOption = { rating: -1, inStock: -1 };
    else if (sort === 'newest') sortOption = { isNewProduct: -1, inStock: -1, createdAt: -1 };

    // حساب الـ Pagination
    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit, 12, 50);

    // تنفيذ الاستعلام
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/store/products/featured
 * @desc    جلب المنتجات المميزة للصفحة الرئيسية (Home Page)
 * @access  Public
 * @query   limit - عدد المنتجات (افتراضي 8)
 * @returns قائمة المنتجات المميزة
 */
router.get('/products/featured', async (req, res) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
  const products = await Product.find({ isFeatured: true, inStock: true, stockCount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/store/products/new-arrivals
 * @desc    جلب أحدث المنتجات (New Arrivals) للصفحة الرئيسية
 * @access  Public
 * @query   limit - عدد المنتجات (افتراضي 8)
 * @returns قائمة أحدث المنتجات
 */
router.get('/products/new-arrivals', async (req, res) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
    const products = await Product.find({ isNewProduct: true })
      .sort({ inStock: -1, createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/store/products/sale
 * @desc    جلب المنتجات المخفّضة (Sale Items)
 * @access  Public
 * @query   limit - عدد المنتجات (افتراضي 8)
 * @returns قائمة المنتجات المخفّضة
 */
router.get('/products/sale', async (req, res) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
    const products = await Product.find({
      isSale: true,
      $or: [
        { salePrice: { $gt: 0 }, $expr: { $lt: ['$salePrice', '$price'] } },
        { originalPrice: { $gt: 0 }, $expr: { $gt: ['$originalPrice', '$price'] } },
      ],
    })
      .sort({ inStock: -1, createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/store/categories
 * @desc    جلب قائمة الفئات مع عدد المنتجات في كل فئة
 * @access  Public
 * @returns [{ category, count }]
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(categories.map(c => ({ category: c._id, count: c.count })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/store/products/:id
 * @desc    جلب تفاصيل منتج واحد (Product Details Page)
 * @access  Public
 * @param   id - معرّف المنتج
 * @returns تفاصيل المنتج الكاملة
 */
router.get('/products/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/store/products/:id/related
 * @desc    جلب منتجات مشابهة (من نفس الفئة) لصفحة تفاصيل المنتج
 * @access  Public
 * @param   id - معرّف المنتج الحالي
 * @query   limit - عدد المنتجات (افتراضي 4)
 * @returns قائمة منتجات مشابهة
 */
router.get('/products/:id/related', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

    const limit = Math.min(12, Number(req.query.limit) || 4);

    // جلب منتجات من نفس الفئة (باستثناء المنتج الحالي)
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      inStock: true,
      stockCount: { $gt: 0 }
    })
      .sort({ rating: -1 })
      .limit(limit);

    res.json(related);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
