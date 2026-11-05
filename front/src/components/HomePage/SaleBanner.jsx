import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../Icons';
import { getImageUrl } from '../../services/api';
import suitImage from '../../assets/optimized/suit.jpg';
import { getEffectivePrice, getRegularPrice, hasValidSalePrice } from '../../utils/pricing';
import { useLanguage } from '../../context/useLanguage';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(price) || 0);

const saleDeadline = () => {
  const configuredDeadline = import.meta.env.VITE_SALE_ENDS_AT;
  if (configuredDeadline) {
    const parsedDeadline = new Date(configuredDeadline).getTime();
    if (Number.isFinite(parsedDeadline)) return parsedDeadline;
  }

  const storageKey = 'aeira-sale-deadline';
  const savedDeadline = Number(window.localStorage.getItem(storageKey));
  if (Number.isFinite(savedDeadline) && savedDeadline > 0) return savedDeadline;

  const nextDeadline = Date.now() + (7 * 24 * 60 * 60 * 1000);
  window.localStorage.setItem(storageKey, String(nextDeadline));
  return nextDeadline;
};

const getTimeParts = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return [
    { value: Math.floor(totalSeconds / 86400), key: 'sale.days' },
    { value: Math.floor((totalSeconds % 86400) / 3600), key: 'sale.hours' },
    { value: Math.floor((totalSeconds % 3600) / 60), key: 'sale.min' },
    { value: totalSeconds % 60, key: 'sale.sec' },
  ];
};

export default function SaleBanner({ product, onProductSelect }) {
  const { t, isRtl } = useLanguage();
  const [deadline] = useState(saleDeadline);
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, deadline - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const countdown = getTimeParts(remaining);

  return (
    <section aria-labelledby="sale-banner-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid overflow-hidden bg-sale-bg text-white md:grid-cols-2">
        <div className="flex min-h-72 flex-col items-start justify-center px-7 py-10 sm:px-12 sm:py-14">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">{t('sale.eyebrow')}</p>
          <h2 id="sale-banner-title" className="max-w-md font-serif text-4xl leading-tight sm:text-5xl">{product ? t('sale.titleActive') : t('sale.titleIdle')}</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">{product ? t('sale.descActive') : t('sale.descIdle')}</p>
          {product && hasValidSalePrice(product) && (
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-semibold">{formatPrice(getEffectivePrice(product))}</span>
              <span className="text-sm text-white/65 line-through">{formatPrice(getRegularPrice(product))}</span>
            </div>
          )}
          {product && Number(product.stockCount) <= 0 && (
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">{t('sale.currentlySoldOut')}</p>
          )}
          {product ? (
            <button type="button" onClick={() => onProductSelect?.(product._id || product.id)} className="mt-7 inline-flex items-center gap-3 border border-white/70 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-surface hover:text-sale">
              {t('sale.shop')} <ArrowRight size={15} className={isRtl ? 'rotate-180' : ''} />
            </button>
          ) : (
            <Link to="/shop" className="mt-7 inline-flex items-center gap-3 border border-white/70 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-surface hover:text-sale">
              {t('sale.explore')} <ArrowRight size={15} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          )}
          <div className="mt-7" aria-label={t('sale.countdownAria')}>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75">{t('sale.endsIn')}</p>
            <div className="flex gap-2">
              {countdown.map(({ value, key }) => (
                <div key={key} className="flex h-[76px] w-[66px] flex-col items-center justify-center border border-white/55 sm:h-[88px] sm:w-[78px]">
                  <span className="font-serif text-3xl leading-none sm:text-4xl">{String(value).padStart(2, '0')}</span>
                  <span className="mt-2 text-[9px] font-medium uppercase tracking-[0.12em]">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="min-h-64 bg-sale-deep md:min-h-80">
          <img src={getImageUrl(product?.image) || suitImage} alt={product?.name || t('sale.imageAlt')} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
