import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewsApi } from '../../services/api';
import { useLanguage } from '../../context/useLanguage';

export default function CustomerReviews() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let active = true;

    reviewsApi.getLatestReviews({ limit: 3 })
      .then((data) => {
        if (active) setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setReviews([]);
      });

    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="customer-reviews-title" className="border-t border-line bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="customer-reviews-title" className="mb-10 text-center font-serif text-3xl text-gray-950 sm:text-4xl">{t('reviewsHome.title')}</h2>
        {reviews.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review._id} className="bg-surface-alt p-6 sm:p-8">
                <div className="mb-4 flex gap-1" aria-label={t('reviewsHome.starsAria', { rating: review.rating })}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={16} className={index < review.rating ? 'fill-accent text-accent' : 'text-muted-soft'} aria-hidden="true" />
                  ))}
                </div>
                {review.title && <h3 className="mb-1 text-sm font-semibold text-gray-900">{review.title}</h3>}
                <p className="text-sm leading-6 text-gray-800">{review.comment}</p>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">{review.userName || review.user?.name || t('reviewsHome.customer')}</p>
                {(review.product?.name || review.productName) && (
                  <p className="mt-1 text-xs text-gray-500">{t('reviewsHome.reviewed')} {review.product?.name || review.productName}</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-lg bg-surface-alt px-6 py-8 text-center text-sm leading-6 text-gray-600">{t('reviewsHome.empty')}</p>
        )}
      </div>
    </section>
  );
}
