import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, MapPin, PackageCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { ordersApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import { useToast } from '../context/useToast';
import { useLanguage } from '../context/useLanguage';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(price) || 0);

const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, isRtl } = useLanguage();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRtl ? ArrowLeft : ArrowRight;

  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;

  const handleContinue = (event) => {
    event.preventDefault();
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) return;
    setPlacingOrder(true);
    setError('');
    try {
      const order = await ordersApi.createOrder({
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
        },
        items: cartItems.map(({ id, quantity, size, color }) => ({
          product: id, quantity, size, color,
        })),
        paymentMethod: 'cod',
      });
      await clearCart();
      toast.success(t('checkout.placed'));
      navigate(`/order-confirmation/${order._id}`, { state: { order }, replace: true });
    } catch (requestError) {
      setError(t('checkout.error'));
      toast.error(requestError.message || t('checkout.error'));
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <Layout>
      <main className="min-h-[65vh] bg-surface py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 hover:text-primary-ink">
            <BackIcon size={15} /> {t('checkout.backToBag')}
          </Link>
          <div className="mt-7 border-b border-line pb-6 sm:mt-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-ink">{t('checkout.eyebrow')}</p>
            <h1 className="mt-2 font-serif text-3xl text-gray-950 sm:text-4xl">{t('checkout.title')}</h1>
            <div className="mt-6 flex max-w-md items-center gap-3 text-xs">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step === 1 ? 'bg-primary text-white' : 'bg-primary-tint text-primary-ink'}`}>{step > 1 ? <Check size={14} /> : '1'}</span>
              <span className={step === 1 ? 'font-semibold text-gray-900' : 'text-gray-500'}>{t('checkout.delivery')}</span>
              <span className="h-px flex-1 bg-line" />
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step === 2 ? 'bg-primary text-white' : 'bg-surface-alt text-gray-500'}`}>2</span>
              <span className={step === 2 ? 'font-semibold text-gray-900' : 'text-gray-500'}>{t('checkout.reviewPayment')}</span>
            </div>
          </div>

          {!cartItems.length ? (
            <div className="py-16 text-center">
              <p className="font-serif text-2xl text-gray-900">{t('checkout.empty')}</p>
              <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-primary-ink underline underline-offset-4">{t('checkout.returnToShop')}</Link>
            </div>
          ) : !isLoggedIn ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <LockKeyhole size={26} className="mx-auto text-primary-ink" />
              <h2 className="mt-4 font-serif text-2xl text-gray-900">{t('checkout.signInTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{t('checkout.signInText')}</p>
              <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-primary-light">
                {t('checkout.signIn')} <ForwardIcon size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 lg:py-10">
              <section className="min-w-0">
                {step === 1 ? (
                  <form onSubmit={handleContinue} className="space-y-5">
                    <div className="mb-6 flex items-center gap-3">
                      <MapPin size={18} className="text-primary-ink" />
                      <h2 className="font-serif text-2xl text-gray-900">{t('checkout.deliveryDetails')}</h2>
                    </div>
                    <label className="block text-xs font-semibold text-gray-600">
                      {t('checkout.fullName')}
                      <input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full border border-line-strong bg-surface px-3 py-3 text-sm outline-none focus:border-primary" />
                    </label>
                    <label className="block text-xs font-semibold text-gray-600">
                      {t('checkout.email')}
                      <input readOnly value={user?.email || ''} autoComplete="email" className="mt-2 w-full border border-line-strong bg-surface-muted px-3 py-3 text-sm text-gray-500" />
                    </label>
                    <label className="block text-xs font-semibold text-gray-600">
                      {t('checkout.phone')}
                      <input required type="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} className="mt-2 w-full border border-line-strong bg-surface px-3 py-3 text-sm outline-none focus:border-primary" />
                    </label>
                    <label className="block text-xs font-semibold text-gray-600">
                      {t('checkout.address')}
                      <textarea required rows={3} autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))} className="mt-2 w-full resize-y border border-line-strong bg-surface px-3 py-3 text-sm outline-none focus:border-primary" />
                    </label>
                    <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-primary-light sm:w-auto">
                      {t('checkout.continueReview')} <ForwardIcon size={15} />
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <h2 className="font-serif text-2xl text-gray-900">{t('checkout.reviewTitle')}</h2>
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-primary-ink underline underline-offset-4">{t('checkout.editDetails')}</button>
                    </div>
                    <div className="mb-8 border border-line p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('checkout.deliveringTo')}</p>
                      <p className="mt-3 text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">{customer.address}</p>
                      <p className="mt-1 text-sm text-gray-600">{customer.phone}</p>
                    </div>
                    <h3 className="mb-3 font-serif text-xl text-gray-900">{t('checkout.paymentMethod')}</h3>
                    <label className="flex cursor-pointer items-start gap-3 border border-primary bg-surface-muted p-4">
                      <input type="radio" checked readOnly className="mt-1 accent-primary" />
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">{t('checkout.cod')}</span>
                        <span className="mt-1 block text-xs leading-5 text-gray-500">{t('checkout.codDesc')}</span>
                      </span>
                    </label>
                    {error && <p role="alert" className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                    <button type="button" onClick={handlePlaceOrder} disabled={placingOrder} className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-primary-light disabled:cursor-wait disabled:opacity-60 sm:w-auto">
                      {placingOrder ? t('checkout.placing') : t('checkout.placeOrder')} <ForwardIcon size={15} />
                    </button>
                  </div>
                )}
              </section>

              <aside className="h-fit border border-line bg-surface-alt p-5 sm:p-7 lg:sticky lg:top-24">
                <h2 className="font-serif text-xl text-gray-900">{t('checkout.summary')}</h2>
                <div className="mt-5 space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between gap-4 text-sm">
                      <div className="min-w-0">
                        <p className="break-words font-medium text-gray-800">{item.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{t('checkout.qty', { qty: item.quantity })}{item.size ? ` · ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}</p>
                      </div>
                      <span className="shrink-0 text-end text-gray-700">
                        {item.originalPrice && <span className="block text-xs text-gray-400 line-through">{formatPrice(item.originalPrice * item.quantity)}</span>}
                        <span className="block">{formatPrice(item.price * item.quantity)}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3 border-t border-line-strong pt-5 text-sm text-gray-600">
                  <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span>{t('cart.shipping')}</span><span>{t('cart.complimentary')}</span></div>
                  <div className="flex justify-between"><span>{t('cart.tax')}</span><span>{formatPrice(tax)}</span></div>
                  <div className="flex justify-between border-t border-line-strong pt-4 text-base font-semibold text-gray-900"><span>{t('cart.total')}</span><span>{formatPrice(total)}</span></div>
                </div>
                <p className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500"><PackageCheck size={14} /> {t('checkout.orderConfirmed')}</p>
              </aside>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Checkout;
