const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/env');

// ── استيراد مسارات الـ API ───────────────────────────────
const authRoutes = require('./routes/authRoutes');       // تسجيل الدخول والتسجيل
const storefrontRoutes = require('./routes/storefrontRoutes'); // واجهة المتجر العامة
const productRoutes = require('./routes/productRoutes'); // مسارات المنتجات العامة
const adminRoutes = require('./routes/adminRoutes');     // لوحة الأدمن
const orderRoutes = require('./routes/orderRoutes');     // الطلبات
const uploadRoutes = require('./routes/uploadRoutes');   // رفع الصور
const reviewRoutes = require('./routes/reviewRoutes');   // التعليقات والتقييمات
const wishlistRoutes = require('./routes/wishlistRoutes'); // قائمة الأمنيات
const cartRoutes = require('./routes/cartRoutes');         // سلة التسوق

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/store', storefrontRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');
    const server = app.listen(config.port, () => {
      console.log(`API server listening at http://localhost:${config.port}`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start API server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) startServer();

module.exports = { app, startServer };
