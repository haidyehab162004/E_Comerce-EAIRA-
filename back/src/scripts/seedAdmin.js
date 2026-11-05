const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 6) {
    throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 6 characters in back/.env.');
  }

  await mongoose.connect(config.mongoUri);
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.isAdmin = true;
      await user.save();
      console.log(`Admin privileges confirmed for ${email}.`);
      return;
    }

    await User.create({ name: 'Admin', email, password, isAdmin: true });
    console.log(`Created admin account for ${email}.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin().catch((error) => {
  console.error('Admin setup failed:', error.message);
  process.exitCode = 1;
});
