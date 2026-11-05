const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

/**
 * ========================================================
 * Cart Routes - /api/cart
 * ========================================================
 * سلة التسوق — تُخزَّن في الداتابيز مرتبطة بالمستخدم:
 *  - جلب السلة (GET /)
 *  - إضافة منتج (POST /)
 *  - تعديل كمية (PUT /:itemId)
 *  - حذف عنصر (DELETE /:itemId)
 *  - مسح الكل (DELETE /)
 * كل الـ routes محمية بالتوكن (protect)
 * ========================================================
 */

/**
 * @route   GET /api/cart
 * @desc    جلب سلة التسوق للمستخدم الحالي
 * @access  Private
 * @returns { cart: [{ _id, product: {name,price,image,category}, quantity, size, color }] }
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product', 'name price originalPrice salePrice isSale image category');

    res.json({ cart: user.cart || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/cart
 * @desc    إضافة منتج للسلة (أو زيادة الكمية لو موجود بنفس المقاس واللون)
 * @access  Private
 * @body    { productId, quantity?, size?, color? }
 * @returns { cart }
 */
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, size = '', color = '' } = req.body;

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({ message: 'الكمية يجب أن تكون عددًا صحيحًا أكبر من صفر.' });
    }

    if (!productId) {
      return res.status(400).json({ message: 'معرّف المنتج مطلوب' });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'معرّف المنتج غير صالح.' });
    }
    const product = await Product.findById(productId);
    if (!product || !product.inStock || product.stockCount < Number(quantity)) {
      return res.status(400).json({ message: 'المنتج غير متوفر بالكمية المطلوبة.' });
    }
    if (size && product.sizes.length && !product.sizes.includes(size)) {
      return res.status(400).json({ message: 'المقاس المختار غير متاح.' });
    }
    if (color && product.colors.length && !product.colors.includes(color)) {
      return res.status(400).json({ message: 'اللون المختار غير متاح.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود.' });

    // البحث عن نفس المنتج بنفس المقاس واللون
    const existingIndex = user.cart.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const requestedTotal = user.cart[existingIndex].quantity + Number(quantity);
      if (requestedTotal > product.stockCount) {
        return res.status(400).json({ message: 'الكمية المطلوبة تتجاوز المخزون المتاح.' });
      }
      // موجود → نزود الكمية
      user.cart[existingIndex].quantity += Number(quantity);
    } else {
      // مش موجود → نضيفه
      user.cart.push({ product: productId, quantity: Number(quantity), size, color });
    }

    await user.save();

    // نرجع السلة مع بيانات المنتجات
    const populated = await User.findById(req.user._id)
      .populate('cart.product', 'name price originalPrice salePrice isSale image category');

    res.json({ cart: populated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/cart/:itemId
 * @desc    تعديل كمية عنصر في السلة
 * @access  Private
 * @param   itemId - معرّف العنصر في السلة (subdocument _id)
 * @body    { quantity }
 * @returns { cart }
 */
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({ message: 'الكمية يجب أن تكون عددًا صحيحًا أكبر من صفر.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود.' });

    const item = user.cart.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'العنصر غير موجود في السلة' });
    }

    item.quantity = Math.max(1, Number(quantity));
    await user.save();

    const populated = await User.findById(req.user._id)
      .populate('cart.product', 'name price originalPrice salePrice isSale image category');

    res.json({ cart: populated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    حذف عنصر معين من السلة
 * @access  Private
 * @param   itemId - معرّف العنصر في السلة
 */
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId);
    await user.save();

    const populated = await User.findById(req.user._id)
      .populate('cart.product', 'name price image category');

    res.json({ cart: populated.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/cart
 * @desc    مسح السلة بالكامل
 * @access  Private
 */
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ cart: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
