import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../Icons';
import suitImage from '../../assets/optimized/suit.jpg';
import { getEffectivePrice, getRegularPrice, hasValidSalePrice } from '../../utils/pricing';
import { useLanguage } from '../../context/useLanguage';
import { getCategoryLabel } from '../../utils/categories';
import ProductImage from '../ProductImage';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
}).format(Number(price) || 0);

export default function NewArrivals({ products = [], onProductSelect }) {
  const { t, isRtl } = useLanguage();
  const scrollerRef = useRef(null);

  const scrollRow = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const rtl = isRtl ? -1 : 1;
    el.scrollBy({ left: direction * rtl * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="new-arrivals-title" className="bg-surface-alt py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-ink">{t('newArrivals.eyebrow')}</p>
            <h2 id="new-arrivals-title" className="font-serif text-3xl text-gray-950 sm:text-4xl">{t('newArrivals.title')}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollRow(-1)}
                aria-label={t('common.previous')}
                className="flex h-8 w-8 items-center justify-center border border-line-strong text-gray-600 transition hover:border-primary hover:text-primary-ink"
              >
                <ArrowRight size={14} className={isRtl ? '' : 'rotate-180'} />
              </button>
              <button
                type="button"
                onClick={() => scrollRow(1)}
                aria-label={t('common.next')}
                className="flex h-8 w-8 items-center justify-center border border-line-strong text-gray-600 transition hover:border-primary hover:text-primary-ink"
              >
                <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
              </button>
            </div>
            <Link to="/shop?sort=newest" className="inline-flex shrink-0 items-center gap-2 border-b border-gray-400 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-700 transition hover:border-primary hover:text-primary-ink">
              {t('common.shopAll')} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>

        {products.length ? (
          <div
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:gap-6 lg:px-8"
          >
            {products.slice(0, 8).map((product) => (
              <button key={product._id || product.id} type="button" onClick={() => onProductSelect?.(product._id || product.id)} className="group w-[46vw] shrink-0 snap-start text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-18px)]">
                <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-line">
                  <ProductImage product={product} fallback={suitImage} alt={product.name || t('newArrivals.title')} />
                  <span className="absolute start-2 top-2 bg-surface px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-800">{t('common.new')}</span>
                  {Number(product.stockCount) <= 0 && (
                    <span className="absolute end-2 top-2 bg-surface px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-red-600">{t('common.soldOut')}</span>
                  )}
                </div>
                <p className="truncate text-[10px] uppercase tracking-[0.12em] text-gray-500">{getCategoryLabel(product.category, t)}</p>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-primary-ink">{product.name}</h3>
                  <span className="shrink-0 text-end">
                    {hasValidSalePrice(product) && <span className="block text-[10px] text-gray-400 line-through">{formatPrice(getRegularPrice(product))}</span>}
                    <span className="block text-xs font-semibold text-primary-ink">{formatPrice(getEffectivePrice(product))}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="border border-line-strong bg-surface px-5 py-8 text-sm text-gray-500">{t('newArrivals.empty')}</p>
        )}
      </div>
    </section>
  );
}
