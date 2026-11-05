import { useMemo, useRef, useState } from 'react';
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

const categoryValues = ['All', 'Pants', 'Bags', 'Dresses'];

export default function PopularCategory({ products = [], onProductSelect }) {
  const { t, isRtl } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const scrollerRef = useRef(null);

  const scrollRow = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const rtl = isRtl ? -1 : 1;
    el.scrollBy({ left: direction * rtl * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
  };

  const selectCategory = (value) => {
    setActiveCategory(value);
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const filters = categoryValues.map((value) => ({
    value,
    label: value === 'All' ? t('popular.all') : t(`home.category.${value.toLowerCase()}`),
  }));
  const activeLabel = filters.find((filter) => filter.value === activeCategory)?.label || activeCategory;

  const visibleProducts = useMemo(() => (
    activeCategory === 'All'
      ? products
      : products.filter((product) => String(product.category || '').toLowerCase() === activeCategory.toLowerCase())
  ), [activeCategory, products]);

  return (
    <section aria-labelledby="popular-products-title" className="bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="shrink-0">
            <h2 id="popular-products-title" className="font-serif text-3xl text-gray-950 sm:text-4xl">{t('popular.title')}</h2>
            <p className="mt-1 text-xs text-gray-500">{t('popular.subtitle')}</p>
          </div>
          <div className="flex min-w-0 items-center gap-4">
            <div className="-mx-4 flex items-center gap-4 overflow-x-auto px-4 pb-1 text-[10px] font-medium sm:mx-0 sm:justify-end sm:gap-5 sm:px-0">
              {filters.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectCategory(value)}
                  aria-pressed={activeCategory === value}
                  className={`shrink-0 border-b pb-1 transition ${activeCategory === value ? 'border-primary text-primary-ink' : 'border-transparent text-gray-600 hover:text-primary-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
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
          </div>
        </div>

        {visibleProducts.length ? (
          <div
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:gap-6 lg:px-8"
          >
            {visibleProducts.slice(0, 8).map((product) => (
              <button
                key={product._id || product.id}
                type="button"
                onClick={() => onProductSelect?.(product._id || product.id)}
                className="group w-[68vw] shrink-0 snap-start text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-18px)]"
              >
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-surface-alt sm:aspect-[5/4]">
                  <ProductImage product={product} fallback={suitImage} alt={product.name || t('popular.title')} />
                  {product.isSale && <span className="absolute start-2 top-2 rounded-sm bg-accent-tint px-2 py-1 text-[9px] font-semibold text-gray-900">{t('common.sale')}</span>}
                  {Number(product.stockCount) <= 0 && <span className="absolute end-2 top-2 rounded-sm bg-surface px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-red-600">{t('common.soldOut')}</span>}
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
          <div className="flex min-h-40 items-center justify-between gap-4 rounded-md border border-line bg-surface px-5 py-6">
            <p className="text-sm text-gray-500">
              {activeCategory === 'All' ? t('popular.emptyAll') : t('popular.emptyCategory', { category: activeLabel })}
            </p>
            {activeCategory !== 'All' && (
              <Link to={`/shop?category=${encodeURIComponent(activeCategory)}`} className="inline-flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-ink">
                {t('popular.browse', { category: activeLabel })} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
              </Link>
            )}
          </div>
        )}
        <Link to="/shop" className="mt-5 inline-flex items-center gap-2 border-b border-gray-400 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-700 transition hover:border-primary hover:text-primary-ink">
          {t('popular.shopAll')} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
        </Link>
      </div>
    </section>
  );
}
