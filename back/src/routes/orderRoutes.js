const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();
const TAX_RATE = 0.1;

router.post('/', protect, async (req, res) => {
  const reservedStock = [];

  try {
    const { items, customer = {}, paymentMethod = 'cod', notes = '' } = req.body;
    if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
      return res.status(400).json({ message: 'بيانات التوصيل غير صالحة.' });
    }
    const deliveryAddress = typeof customer.address === 'string' ? customer.address.trim() : '';
    if (!deliveryAddress && !req.user.address) {
      return res.status(400).json({ message: 'أدخل عنوان التوصيل قبل تأكيد الطلب.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'أضف منتجًا واحدًا على الأقل للطلب.' });
    }
    if (paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'الدفع الإلكتروني غير متاح حاليًا. اختر الدفع عند الاستلام.' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.product,
      quantity: Number(item.quantity),
      size: typeof item.size === 'string' ? item.size : '',
      color: typeof item.color === 'string' ? item.color : '',
    }));

    if (normalizedItems.some((item) => !mongoose.isValidObjectId(item.productId)
      || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return res.status(400).json({ message: 'بيانات المنتجات أو الكميات غير صالحة.' });
    }

    const products = await Product.find({ _id: { $in: normalizedItems.map((item) => item.productId) } });
    const productById = new Map(products.map((product) => [product.id, product]));
    const orderItems = [];

    for (const item of normalizedItems) {
      const product = productById.get(String(item.productId));
      if (!product || !product.inStock || product.stockCount < item.quantity) {
        return res.status(409).json({ message: 'أحد المنتجات غير متوفر بالكمية المطلوبة.' });
      }
      if (item.size && product.sizes.length && !product.sizes.includes(item.size)) {
        return res.status(400).json({ message: `المقاس ${item.size} غير متاح للمنتج ${product.name}.` });
      }
      if (item.color && product.colors.length && !product.colors.includes(item.color)) {
        return res.status(400).json({ message: `اللون المختار غير متاح للمنتج ${product.name}.` });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: product.isSale && product.salePrice > 0 && product.salePrice < product.price
          ? product.salePrice
          : product.price,
      });
    }

    const quantitiesByProduct = new Map();
    for (const item of normalizedItems) {
      const key = String(item.productId);
      quantitiesByProduct.set(key, (quantitiesByProduct.get(key) || 0) + item.quantity);
    }

    for (const [productId, quantity] of quantitiesByProduct) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, inStock: true, stockCount: { $gte: quantity } },
        { $inc: { stockCount: -quantity } },
        { new: true }
      );
      if (!product) {
        const error = new Error('نفدت كمية أحد المنتجات أثناء إتمام الطلب. حدّث السلة وحاول مجددًا.');
        error.statusCode = 409;
        throw error;
      }

      reservedStock.push({ productId, quantity });
      if (product.stockCount === 0) {
        await Product.updateOne({ _id: productId, stockCount: 0 }, { $set: { inStock: false } });
      }
    }

    const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
    const order = await Order.create({
      user: req.user._id,
      customer: {
        name: customer.name?.trim() || req.user.name,
        email: req.user.email,
        phone: customer.phone?.trim() || req.user.phone || '',
        address: deliveryAddress || req.user.address,
      },
      items: orderItems,
      subtotal,
      shippingCost: 0,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      paymentMethod: 'cod',
      notes: typeof notes === 'string' ? notes.slice(0, 1000) : '',
    });

    return res.status(201).json(order);
  } catch (error) {
    await Promise.allSettled(reservedStock.map(({ productId, quantity }) =>
      Product.updateOne(
        { _id: productId },
        { $inc: { stockCount: quantity }, $set: { inStock: true } }
      )
    ));
    return res.status(error.statusCode || 500).json({ message: error.message || 'تعذر إنشاء الطلب.' });
  }
});

router.get('/my/history', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'تعذر تحميل سجل الطلبات.' });
  }
});

router.get('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'الطلب غير موجود.' });
  }

  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price');
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود.' });
    if (!req.user.isAdmin && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'ليست لديك صلاحية لعرض هذا الطلب.' });
    }
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'تعذر تحميل الطلب.' });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'الطلب غير موجود.' });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'pending' },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود أو لم يعد قابلًا للإلغاء.' });
    }

    await Promise.all(order.items.map((item) => Product.updateOne(
      { _id: item.product },
      { $inc: { stockCount: item.quantity }, $set: { inStock: true } }
    )));
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'تعذر إلغاء الطلب.' });
  }
});

module.exports = router;
