import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { ordersApi } from '../services/api';
import { useLanguage } from '../context/useLanguage';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(price) || 0);

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t, isRtl } = useLanguage();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (order) return undefined;
    let active = true;
    ordersApi.getOrderById(id)
      .then((data) => { if (active) setOrder(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, order]);

  const status = String(order?.status || 'pending').toLowerCase();
  const arrowClass = isRtl ? 'rotate-180' : '';

  return (
    <Layout>
      <main className="min-h-[65vh] bg-surface-alt px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-2xl border border-line bg-surface p-6 text-center sm:p-10">
          {loading ? (
            <p className="py-10 text-sm text-gray-500">{t('order.loading')}</p>
          ) : error || !order ? (
            <>
              <h1 className="font-serif text-2xl text-gray-900">{t('order.unavailable')}</h1>
              <p className="mt-3 text-sm text-gray-500">{t('order.notFound')}</p>
              <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-ink underline underline-offset-4">{t('order.returnToShop')} <ArrowRight size={15} className={arrowClass} /></Link>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary-ink"><Check size={25} /></span>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-ink">{t('order.received')}</p>
              <h1 className="mt-2 font-serif text-3xl text-gray-950 sm:text-4xl">
                {order.customer?.name
                  ? t('order.thanks', { name: order.customer.name })
                  : t('order.thanksGeneric')}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">{t('order.saved')}</p>
              <div className="mt-8 border-y border-line py-5 text-start">
                <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="text-gray-500">{t('order.number')}</span><span className="font-semibold text-gray-900">#{String(order._id || id).slice(-8).toUpperCase()}</span></div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm"><span className="text-gray-500">{t('order.status')}</span><span className="text-gray-900">{t(`order.status.${status}`)}</span></div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm"><span className="text-gray-500">{t('order.payment')}</span><span className="text-gray-900">{t('order.cod')}</span></div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm"><span className="text-gray-500">{t('order.total')}</span><span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span></div>
              </div>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-primary-light">{t('order.continue')} <ArrowRight size={14} className={arrowClass} /></Link>
                <Link to="/" className="inline-flex items-center justify-center gap-2 border border-line-strong px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-primary">{t('order.backHome')}</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default OrderConfirmation;
