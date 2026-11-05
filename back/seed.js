const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store';

const products = [
  {
    name: "تيشيرت صيفي كاجوال",
    description: "تيشيرت قطني 100% مناسب لفصل الصيف، مريح وعملي.",
    price: 150,
    originalPrice: 200,
    category: "men",
    subcategory: "t-shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["#FFFFFF", "#000000", "#FF0000"],
    inStock: true,
    stockCount: 50,
    rating: 4.5,
    numReviews: 12,
    isNewProduct: true,
    isSale: true,
    isFeatured: true
  },
  {
    name: "فستان سهرة أنيق",
    description: "فستان سهرة طويل بلون جذاب ومناسب للمناسبات الخاصة.",
    price: 850,
    originalPrice: 1000,
    category: "women",
    subcategory: "dresses",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1572804013309-2757c6b41eea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["#000000", "#FFD700", "#FF0000"],
    inStock: true,
    stockCount: 15,
    rating: 4.8,
    numReviews: 34,
    isNewProduct: false,
    isSale: true,
    isFeatured: true
  },
  {
    name: "جاكيت جلد كلاسيكي",
    description: "جاكيت جلد طبيعي بتصميم عصري وأنيق للرجال.",
    price: 1200,
    category: "men",
    subcategory: "jackets",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["#000000", "#8B4513"],
    inStock: true,
    stockCount: 20,
    rating: 4.9,
    numReviews: 22,
    isNewProduct: true,
    isSale: false,
    isFeatured: true
  },
  {
    name: "حذاء رياضي مريح",
    description: "حذاء رياضي خفيف الوزن ومناسب للجري والمشي.",
    price: 450,
    originalPrice: 500,
    category: "shoes",
    subcategory: "sneakers",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["#FF0000", "#FFFFFF", "#000000"],
    inStock: true,
    stockCount: 100,
    rating: 4.7,
    numReviews: 50,
    isNewProduct: false,
    isSale: true,
    isFeatured: true
  },
  {
    name: "حقيبة ظهر للسفر",
    description: "حقيبة ظهر واسعة وعملية للسفر والرحلات الطويلة.",
    price: 300,
    category: "accessories",
    subcategory: "bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["One Size"],
    colors: ["#000000", "#0000FF", "#808080"],
    inStock: true,
    stockCount: 30,
    rating: 4.3,
    numReviews: 18,
    isNewProduct: false,
    isSale: false,
    isFeatured: false
  },
  {
    name: "بنطلون جينز أزرق",
    description: "بنطلون جينز كلاسيكي مريح مناسب للاستخدام اليومي.",
    price: 250,
    category: "women",
    subcategory: "pants",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["28", "30", "32", "34"],
    colors: ["#0000FF", "#000080"],
    inStock: true,
    stockCount: 40,
    rating: 4.6,
    numReviews: 25,
    isNewProduct: false,
    isSale: false,
    isFeatured: true
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected Successfully.");

    console.log("Deleting old products...");
    await Product.deleteMany({});
    
    console.log("Inserting new dummy products...");
    await Product.insertMany(products);

    console.log("Products added successfully!");
    
    // Check if an admin exists, if not, create one from the environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      console.log("Skipping admin creation: set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
    } else {
      const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
      if (!adminExists) {
        console.log("Creating default Admin user...");
        const admin = new User({
          name: "مدير النظام",
          email: adminEmail,
          password: adminPassword, // Will be hashed by pre('save') hook
          isAdmin: true,
          phone: "01000000000",
          address: "القاهرة, مصر"
        });
        await admin.save();
        console.log(`Admin user created (${adminEmail}).`);
      } else {
        console.log("Admin user already exists.");
      }
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
