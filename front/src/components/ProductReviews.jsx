import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useLanguage } from '../context/useLanguage';

const ratingLabels = [5, 4, 3, 2, 1];

function ReviewStars({ rating, size = 15, label }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={label}>
      {ratingLabels.slice(0, 5).map((value) => (
        <Star key={value} size={size} className={value <= rating ? 'fill-accent text-accent' : 'text-muted-soft'} />
      ))}
    </span>
  );
}

const ProductReviews = ({ productId }) => {
  const { isLoggedIn, user } = useAuth();
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [reviewData, setReviewData] = useState({ reviews: [], total: 0, pages: 0, avgRating: 0, ratingBreakdown: {} });
  const [myReview, setMyReview] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const dateLocale = lang === 'ar' ? 'ar-EG' : 'en-GB';

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewsApi.getProductReviews(productId, { page, limit: 5, sort });
      setReviewData(data);
    } catch (error) {
      toast.error(error.message || t('reviews.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [productId, page, sort, toast, t]);

  const fetchMyReview = useCallback(async () => {
    if (!isLoggedIn) {
      setMyReview(null);
      return;
    }
    try {
      const data = await reviewsApi.getMyProductReview(productId);
      setMyReview(data.review || null);
    } catch (error) {
      toast.error(error.message || t('reviews.myReviewFailed'));
    }
  }, [isLoggedIn, productId, toast, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchReviews(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchReviews]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchMyReview(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMyReview]);

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setComment('');
    setEditing(false);
  };

  const startEditing = () => {
    setRating(myReview.rating);
    setTitle(myReview.title || '');
    setComment(myReview.comment || '');
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) {
      toast.error(t('reviews.pleaseRate'));
      return;
    }
    if (!comment.trim()) {
      toast.error(t('reviews.pleaseWrite'));
      return;
    }

    setSubmitting(true);
    try {
      const review = { rating, title: title.trim(), comment: comment.trim() };
      if (editing && myReview) {
        await reviewsApi.updateReview(myReview._id, review);
        toast.success(t('reviews.updated'));
      } else {
        await reviewsApi.addProductReview(productId, review);
        toast.success(t('reviews.added'));
      }
      resetForm();
      await Promise.all([fetchReviews(), fetchMyReview()]);
    } catch (error) {
      toast.error(error.message || t('reviews.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview || !window.confirm(t('reviews.confirmDelete'))) return;
    try {
      await reviewsApi.deleteReview(myReview._id);
      setMyReview(null);
      resetForm();
      toast.success(t('reviews.deleted'));
      await fetchReviews();
    } catch (error) {
      toast.error(error.message || t('reviews.deleteFailed'));
    }
  };

  const breakdown = reviewData.ratingBreakdown || {};

  return (
    <section id="product-reviews" className="scroll-mt-24 border-t border-line bg-surface-alt py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-ink">{t('reviews.eyebrow')}</p>
            <h2 className="font-serif text-3xl text-gray-950 sm:text-4xl">{t('reviews.title')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <ReviewStars
              rating={Math.round(reviewData.avgRating)}
              size={17}
              label={t('reviewsHome.starsAria', { rating: Math.round(reviewData.avgRating) })}
            />
            <span className="text-sm font-semibold text-gray-900">{reviewData.avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({t('product.reviews', { count: reviewData.total })})</span>
          </div>
        </div>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="space-y-6">
            <div className="border border-line-strong bg-surface p-6 sm:p-7">
              <div className="mb-5 flex items-end gap-3">
                <span className="font-serif text-5xl text-gray-950">{reviewData.avgRating.toFixed(1)}</span>
                <span className="pb-1 text-xs text-gray-500">{t('reviews.outOf5')}</span>
              </div>
              <div className="space-y-3">
                {ratingLabels.map((stars) => {
                  const count = Number(breakdown[stars]) || 0;
                  const percentage = reviewData.total ? (count / reviewData.total) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="w-3">{stars}</span>
                      <Star size={12} className="fill-accent text-accent" />
                      <div className="h-1.5 flex-1 overflow-hidden bg-surface-alt">
                        <div className="h-full bg-accent transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-5 text-end">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isLoggedIn ? (
              <div className="border border-line-strong bg-surface p-6 sm:p-7">
                {myReview && !editing ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-ink">{t('reviews.yourReview')}</p>
                    <div className="mt-3">
                      <ReviewStars
                        rating={myReview.rating}
                        label={t('reviewsHome.starsAria', { rating: myReview.rating })}
                      />
                    </div>
                    {myReview.title && <h3 className="mt-3 text-sm font-semibold text-gray-900">{myReview.title}</h3>}
                    <p className="mt-2 text-sm leading-6 text-gray-600">{myReview.comment}</p>
                    <div className="mt-5 flex gap-4">
                      <button type="button" onClick={startEditing} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-ink hover:underline">
                        <Pencil size={13} /> {t('reviews.edit')}
                      </button>
                      <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline">
                        <Trash2 size={13} /> {t('reviews.delete')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{editing ? t('reviews.editTitle') : t('reviews.write')}</h3>
                      <p className="mt-1 text-xs text-gray-500">{t('reviews.writeHint')}</p>
                    </div>
                    <div className="flex items-center gap-1" role="group" aria-label={t('reviews.chooseRating')}>
                      {ratingLabels.map((value) => (
                        <button key={value} type="button" onClick={() => setRating(value)} aria-label={t('reviews.starAria', { value })} aria-pressed={rating === value} className="rounded-sm p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <Star size={20} className={value <= rating ? 'fill-accent text-accent' : 'text-muted-soft'} />
                        </button>
                      ))}
                    </div>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={100}
                      placeholder={t('reviews.titlePlaceholder')}
                      aria-label={t('reviews.titleAria')}
                      className="w-full border border-line-strong bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-primary"
                    />
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      maxLength={1000}
                      rows={4}
                      required
                      placeholder={t('reviews.commentPlaceholder')}
                      aria-label={t('reviews.commentAria')}
                      className="w-full resize-y border border-line-strong bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-primary"
                    />
                    <div className="flex gap-3">
                      <button type="submit" disabled={submitting} className="bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-primary-light disabled:opacity-60">
                        {submitting ? t('reviews.saving') : editing ? t('reviews.saveChanges') : t('reviews.submit')}
                      </button>
                      {editing && <button type="button" onClick={resetForm} className="px-3 py-3 text-xs text-gray-500 hover:text-gray-900">{t('reviews.cancel')}</button>}
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="border border-line-strong bg-surface p-6 sm:p-7">
                <h3 className="text-sm font-semibold text-gray-900">{t('reviews.have')}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{t('reviews.signInToShare')}</p>
                <Link to="/login" state={{ from: { pathname: `/product/${productId}` } }} className="mt-4 inline-block text-xs font-semibold text-primary-ink underline underline-offset-4">{t('reviews.signInToReview')}</Link>
              </div>
            )}
          </div>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-800">{t('reviews.customerReviews')}</h3>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                {t('reviews.sort')}
                <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="border border-line-strong bg-surface px-2 py-2 text-xs text-gray-700 outline-none focus:border-primary">
                  <option value="newest">{t('reviews.sortNewest')}</option>
                  <option value="oldest">{t('reviews.sortOldest')}</option>
                  <option value="highest">{t('reviews.sortHighest')}</option>
                  <option value="lowest">{t('reviews.sortLowest')}</option>
                </select>
              </label>
            </div>

            {loading ? (
              <p className="border border-line-strong bg-surface p-8 text-center text-sm text-gray-500">{t('reviews.loading')}</p>
            ) : reviewData.reviews.length ? (
              <div className="divide-y divide-line border-y border-line bg-surface px-4 sm:px-7">
                {reviewData.reviews.map((review) => {
                  const reviewUserId = review.user?._id || review.user;
                  return (
                    <article key={review._id} className="py-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <ReviewStars
                            rating={review.rating}
                            label={t('reviewsHome.starsAria', { rating: review.rating })}
                          />
                          {review.title && <h4 className="mt-2 text-sm font-semibold text-gray-900">{review.title}</h4>}
                        </div>
                        <time dateTime={review.createdAt} className="shrink-0 text-[10px] text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(dateLocale)}
                        </time>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment}</p>
                      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                        {review.user?.name || review.userName || t('reviews.customer')}
                        {user?.id && String(reviewUserId) === String(user.id) ? ` · ${t('reviews.you')}` : ''}
                      </p>
                    </article>
                  );
                })}
                {reviewData.pages > 1 && (
                  <div className="flex items-center justify-between py-4 text-xs text-gray-500">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="font-semibold text-primary-ink disabled:opacity-40">{t('common.previous')}</button>
                    <span>{t('reviews.page', { page, pages: reviewData.pages })}</span>
                    <button type="button" disabled={page >= reviewData.pages} onClick={() => setPage((current) => current + 1)} className="font-semibold text-primary-ink disabled:opacity-40">{t('common.next')}</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
                <p className="font-serif text-xl text-gray-900">{t('reviews.none')}</p>
                <p className="mt-2 text-sm text-gray-500">{t('reviews.noneHint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
