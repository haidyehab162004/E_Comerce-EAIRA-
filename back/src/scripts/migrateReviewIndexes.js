const mongoose = require('mongoose');
const config = require('../config/env');
const Review = require('../models/Review');

async function migrateReviewIndexes() {
  await mongoose.connect(config.mongoUri);

  try {
    const indexes = await Review.collection.indexes();
    if (indexes.some((index) => index.name === 'user_1')) {
      await Review.collection.dropIndex('user_1');
      console.log('Removed the old one-review-per-user index.');
    }

    await Review.createIndexes();
    console.log('Product review indexes are ready.');
  } finally {
    await mongoose.disconnect();
  }
}

migrateReviewIndexes().catch((error) => {
  console.error('Review index migration failed:', error.message);
  process.exitCode = 1;
});
