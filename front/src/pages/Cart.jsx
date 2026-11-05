import Layout from '../components/Layout';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import { useCart } from '../context/useCart';
import { useToast } from '../context/useToast';
import { useLanguage } from '../context/useLanguage';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(price) || 0);

const Cart = () => {
  const toast = useToast();
  const { t, isRtl } = useLanguage();
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  // حساب الإجماليات
  const shipping    = 0;
  const tax         = Math.round(subtotal * 0.1 * 100) / 100;
  const totalAmount = subtotal + shipping + tax;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <Layout>
      <div className="bg-surface min-h-screen py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 font-serif text-3xl sm:mb-12 sm:text-4xl">{t('cart.title')}</h1>

          <div className="flex min-w-0 flex-col gap-10 lg:flex-row lg:gap-16">

            {/* قائمة المنتجات */}
            <div className="flex-grow space-y-8">
              {cartItems.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                  <p className="text-gray-500 mb-2">{t('cart.empty')}</p>
                  <p className="text-sm text-gray-400 mb-8">{t('cart.emptyHint')}</p>
                  <Link
                    to="/shop"
                    className="inline-block bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all"
                  >
                    {t('cart.startShopping')}
                  </Link>
                </div>
              ) : cartItems.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex min-w-0 gap-4 py-6 border-b border-line last:border-0 sm:gap-6 sm:py-8">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className="h-32 w-24 flex-shrink-0 object-cover bg-gray-100 sm:h-40 sm:w-32" />
                  ) : (
                    <div className="w-32 h-40 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                  )}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex min-w-0 flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-medium text-gray-900 sm:text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{t('cart.size')}: {item.size} | {t('cart.color')}: {item.color}</p>
                      </div>
                      <div className="text-end">
                        {item.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice * item.quantity)}</p>}
                        <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-between items-center gap-3 sm:mt-6">
                      {/* التحكم في الكمية */}
                      <div className="flex items-center border border-line-strong">
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, -1)} className="p-2 text-gray-500 hover:text-ink transition-colors"><Minus size={14} /></button>
                        <span className="px-4 text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, +1)} className="p-2 text-gray-500 hover:text-ink transition-colors"><Plus size={14} /></button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.id, item.size, item.color);
                          toast.info(t('cart.removed'));
                        }}
                        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} className="me-2" /> {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length > 0 && (
                <Link to="/shop" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-ink transition-colors pt-8">
                  <BackIcon size={16} className="me-2" /> {t('cart.continue')}
                </Link>
              )}
            </div>

            {/* ملخص الطلب */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-96">
                <div className="space-y-6 bg-surface-muted p-5 sm:p-8 lg:sticky lg:top-24">
                  <h3 className="text-xl font-serif mb-4">{t('cart.summary')}</h3>

                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between"><span>{t('cart.shipping')}</span><span>{shipping === 0 ? t('cart.complimentary') : formatPrice(shipping)}</span></div>
                    <div className="flex justify-between"><span>{t('cart.tax')}</span><span>{formatPrice(tax)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-4">
                      <span>{t('cart.total')}</span><span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary-light"
                  >
                    <LockKeyhole size={14} /> {t('cart.checkout')}
                  </Link>
                  <p className="text-center text-[10px] uppercase tracking-widest text-gray-400">{t('cart.cod')}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
