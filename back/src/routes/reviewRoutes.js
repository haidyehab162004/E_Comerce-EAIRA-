const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { getPagination } = require('../utils/query');

const router = express.Router();

const buildRatingBreakdown = (rows) => {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rows.forEach(({ _id, count }) => { breakdown[_id] = count; });
  return breakdown;
};

async function syncProductRating(productId) {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        average: { $avg: '$rating' },
      },
    },
  ]);

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        rating: stats ? Math.round(stats.average * 10) / 10 : 0,
        numReviews: stats?.count || 0,
      },
    },
  );
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validateReviewInput({ rating, comment, title }) {
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return 'Rating must be a whole number between 1 and 5.';
  }
  if (typeof comment !== 'string' || !comment.trim()) {
    return 'Review text is required.';
  }
  if (comment.trim().length > 1000) {
    return 'Review text cannot exceed 1000 characters.';
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim().length > 100)) {
    return 'Review title cannot exceed 100 characters.';
  }
  return null;
}

/** أحدث التقييمات على مستوى المتجر (تُستخدم في الصفحة الرئيسية) */
router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 3));
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name avatar')
      .populate('product', 'name image category')
      .lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load latest reviews.' });
  }
});

/** List reviews and rating summary for one product. */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const { page, limit, sort = 'newest' } = req.query;
    const sortOption = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    }[sort] || { createdAt: -1 };
    const pagination = getPagination(page, limit, 5, 50);
    const filter = { product: productId };

    const [reviews, total, ratingRows] = await Promise.all([
      Review.find(filter)
        .sort(sortOption)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('user', 'name avatar')
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const ratingTotal = ratingRows.reduce((sum, row) => sum + row._id * row.count, 0);
    res.json({
      reviews,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit),
      avgRating: total ? Math.round((ratingTotal / total) * 10) / 10 : 0,
      ratingBreakdown: buildRatingBreakdown(ratingRows),
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load product reviews.' });
  }
});

router.get('/product/:productId/mine', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const review = await Review.findOne({ product: productId, user: req.user._id })
      .populate('user', 'name avatar')
      .lean();
    res.json({ review });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load your review.' });
  }
});

/** Create one review per signed-in user and product. */
router.post('/product/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' });
    }

    const validationError = validateReviewInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.findById(productId).select('_id');
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      userName: req.user.name || 'Customer',
      rating: Number(req.body.rating),
      comment: req.body.comment.trim(),
      title: typeof req.body.title === 'string' ? req.body.title.trim() : '',
    });

    await syncProductRating(product._id);
    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }
    res.status(500).json({ message: 'Unable to save your review.' });
  }
});

router.put('/:reviewId', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review id.' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own review.' });
    }

    const nextReview = {
      rating: req.body.rating ?? review.rating,
      comment: req.body.comment ?? review.comment,
      title: req.body.title ?? review.title,
    };
    const validationError = validateReviewInput(nextReview);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    review.rating = Number(nextReview.rating);
    review.comment = nextReview.comment.trim();
    review.title = nextReview.title.trim();
    await review.save();

    if (review.product) await syncProductRating(review.product);
    const updatedReview = await Review.findById(review._id).populate('user', 'name avatar');
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update your review.' });
  }
});

router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({ message: 'Invalid review id.' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You cannot delete this review.' });
    }

    const productId = review.product;
    await review.deleteOne();
    if (productId) await syncProductRating(productId);
    res.json({ message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete the review.' });
  }
});

module.exports = router;
