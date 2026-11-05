import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/useWishlist';
import { useCart } from '../context/useCart';
import { useToast } from '../context/useToast';
import { useLanguage } from '../context/useLanguage';
import { getCategoryLabel } from '../utils/categories';
import ProductImage from '../components/ProductImage';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getEffectivePrice, getRegularPrice, hasValidSalePrice } from '../utils/pricing';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(price) || 0);

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();
  const { t, isRtl } = useLanguage();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    toast.success(t('wishlist.added', { name: item.name }));
  };

  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Navbar />
      <main className="grow bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-gray-900">{t('wishlist.title')}</h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest">
              {t('wishlist.items', { count: wishlistCount })}
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Heart size={56} className="text-gray-200 mb-6" />
              <h2 className="text-xl font-serif text-gray-700 mb-2">{t('wishlist.empty')}</h2>
              <p className="text-sm text-gray-400 mb-8">{t('wishlist.emptyHint')}</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all"
              >
                {t('wishlist.browse')} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, i) => (
                <div
                  key={item.id}
                  className="stagger-item bg-surface border border-line group"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="relative block overflow-hidden aspect-[3/4] bg-surface-muted">
                    {item.image ? (
                      <ProductImage product={item} alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={40} className="text-gray-200" />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{getCategoryLabel(item.category, t)}</p>
                    )}
                    <Link to={`/product/${item.id}`} className="block">
                      <h3 className="text-sm font-bold text-gray-900 hover:text-primary-ink transition-colors mb-1 truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mb-4 flex items-baseline gap-2">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(getEffectivePrice(item))}</p>
                      {hasValidSalePrice(item) && <p className="text-xs text-gray-400 line-through">{formatPrice(getRegularPrice(item))}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 flex items-center justify-center gap-1 bg-primary text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-light transition-all"
                      >
                        <ShoppingBag size={13} /> {t('wishlist.addToBag')}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2.5 border border-line-strong text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        title={t('wishlist.remove')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
