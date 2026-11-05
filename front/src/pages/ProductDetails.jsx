import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Minus, Plus, Heart, ShieldCheck, Truck, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { storeApi, getImageUrl } from '../services/api';
import { useCart } from '../context/useCart';
import { useWishlist } from '../context/useWishlist';
import { useToast } from '../context/useToast';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../context/useLanguage';
import coatImg from '../assets/optimized/coat.jpg';
import ProductReviews from '../components/ProductReviews';
import ProductImage from '../components/ProductImage';
import { getCategoryLabel } from '../utils/categories';
import { getEffectivePrice, getRegularPrice, hasValidSalePrice } from '../utils/pricing';

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
}).format(Number(price) || 0);

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const toast = useToast();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();

  const [product, setProduct]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [quantity, setQuantity]           = useState(1);
  const [selectedSize, setSelectedSize]   = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [selectedImage, setSelectedImage]   = useState(null);

  // ── حالة كاروسيل المنتجات المشابهة ────────────────────────
  const [relatedProducts, setRelatedProducts] = useState([]);
  const carouselRef = useRef(null);

  // ── جلب بيانات المنتج الأساسي ──────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await storeApi.getProductById(id);
        setProduct(data);
        setSelectedImage(data.image || null);
        if (data.sizes?.length)  setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      } catch (err) {
        console.error('خطأ في جلب المنتج:', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // ── جلب منتجات مشابهة (من نفس الفئة) للكاروسيل ─────────────
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const params = product?.category ? { category: product.category } : {};
        const data = await storeApi.getProducts(params);
        const list = data.products || data || [];
        setRelatedProducts(list.filter(p => p._id !== id).slice(0, 10));
      } catch {
        console.error('Error fetching related products');
      }
    };
    if (product) fetchRelated();
  }, [product, id]);

  // ── دوال تمرير الكاروسيل يمين/شمال ─────────────────────────
  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // شاشات التحميل والخطأ
  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center text-gray-400">{t('product.loading')}</div></Layout>;
  if (!product) return <Layout><div className="min-h-screen flex items-center justify-center text-red-500">{t('product.notFound')}</div></Layout>;

  const sizes  = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = product.colors && product.colors.length > 0 ? product.colors : ['#00332B', '#000000', '#9ca3af'];
  const isSoldOut = Number(product.stockCount) <= 0;

  // إضافة للسلة
  const handleAddToCart = () => {
    if (isSoldOut) {
      toast.info(t('product.soldOutToast'));
      return;
    }
    if (!isLoggedIn) {
      window.dispatchEvent(new Event('show-guest-overlay'));
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.cart(t('product.addedToast', { name: product.name }));

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <Layout>
      <div className="bg-surface min-h-screen py-12 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">

            {/* الصور */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={getImageUrl(selectedImage) || coatImg}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {(() => {
                const allImages = [
                  product.image,
                  ...(product.images || []),
                ].filter(Boolean);
                return allImages.length > 1 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {allImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`aspect-square bg-gray-100 overflow-hidden cursor-pointer border-2 transition-colors ${
                          getImageUrl(selectedImage) === getImageUrl(img)
                            ? 'border-gray-900'
                            : 'border-transparent hover:border-gray-400'
                        }`}
                      >
                        <img src={getImageUrl(img)} alt={t('product.thumb', { n: i + 1 })} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            {/* التفاصيل */}
            <div className="flex flex-col">
              <div className="border-b border-line pb-8 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{getCategoryLabel(product.category, t)}</span>
                <h1 className="mb-4 break-words font-serif text-3xl sm:text-4xl">{product.name}</h1>
                <a href="#product-reviews" className="mb-4 inline-flex items-center gap-2 text-xs text-gray-600 transition hover:text-primary-ink">
                  <Star size={14} className="fill-accent text-accent" />
                  <span>{Number(product.rating || 0).toFixed(1)}</span>
                  <span className="underline underline-offset-4">{t('product.reviews', { count: product.numReviews || 0 })}</span>
                </a>
                <div className="flex items-baseline gap-3">
                  <p className={`text-2xl font-bold ${hasValidSalePrice(product) ? 'text-sale' : 'text-gray-900'}`}>{formatPrice(getEffectivePrice(product))}</p>
                  {hasValidSalePrice(product) && <p className="text-base text-gray-400 line-through">{formatPrice(getRegularPrice(product))}</p>}
                </div>
              </div>

              <p className="text-gray-500 leading-relaxed mb-10">{product.description}</p>

              <div className="space-y-8 mb-12">

                {/* الألوان */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
                    {t('product.color')} <span className="text-gray-400 font-normal lowercase ms-1">({selectedColor})</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-gray-900 scale-110' : 'border-line-strong'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* المقاسات */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">{t('product.size')}: {selectedSize}</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-xs font-bold border transition-all ${selectedSize === size ? 'border-gray-900 bg-primary text-white' : 'border-line-strong hover:border-gray-900'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* الكمية والإضافة للسلة */}
                <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:gap-4">
                  <div className="flex items-center border border-line-strong">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-4 text-gray-500 hover:text-ink transition-colors"><Minus size={16} /></button>
                    <span className="px-4 font-bold text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-4 text-gray-500 hover:text-ink transition-colors"><Plus size={16} /></button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={`min-w-[160px] flex-1 py-4 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                      isSoldOut
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : addedAnimation
                          ? 'bg-green-600 text-white'
                          : 'bg-primary text-white hover:bg-primary-light'
                    }`}
                  >
                    {isSoldOut ? (
                      t('product.soldOut')
                    ) : addedAnimation ? (
                      <><Check size={16} /> {t('product.added')}</>
                    ) : (
                      t('common.addToBag')
                    )}
                  </button>
                  <button
                    onClick={() => {
                      toggleWishlist(product);
                      const wishlisted = isWishlisted(product._id);
                      toast[wishlisted ? 'info' : 'success'](
                        wishlisted
                          ? t('product.removedWishlist', { name: product.name })
                          : t('product.addedWishlist', { name: product.name })
                      );
                    }}
                    className={`p-4 border transition-all ${
                      isWishlisted(product._id)
                        ? 'border-red-300 text-red-500 bg-red-50'
                        : 'border-line-strong text-gray-500 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Heart size={20} className={isWishlisted(product._id) ? 'fill-red-500' : ''} />
                  </button>
                </div>
              </div>

              {/* مزايا الشحن */}
              <div className="grid grid-cols-2 gap-6 pt-10 border-t border-line text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-gray-900" />
                  <span>{t('product.freeShipping')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-gray-900" />
                  <span>{t('product.authenticity')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews key={product._id} productId={product._id} />

      {/* ════════════════════════════════════════════════════ */}
      {/* كاروسيل المنتجات المشابهة — Complete the Look       */}
      {/* ════════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <div className="bg-surface border-t border-line py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">{t('product.completeLook')}</h2>
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-2">{t('product.youMayLike')}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="w-10 h-10 border border-line-strong flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all"
                  aria-label={t('product.scrollLeft')}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="w-10 h-10 border border-line-strong flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all"
                  aria-label={t('product.scrollRight')}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  className="group flex-shrink-0 w-[220px] sm:w-[240px] snap-start"
                >
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative">
                    <ProductImage product={item} fallback={coatImg} alt={item.name} hoverScale="group-hover:scale-105" />
                    {item.isNewProduct && (
                      <span className="absolute top-3 start-3 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                        {t('common.new')}
                      </span>
                    )}
                    {item.isSale && (
                      <span className="absolute top-3 end-3 bg-accent text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                        {t('common.sale')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-ink transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(getEffectivePrice(item))}</p>
                    {hasValidSalePrice(item) && <p className="text-xs text-gray-400 line-through">{formatPrice(getRegularPrice(item))}</p>}
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/shop"
                className="inline-block text-[10px] font-bold uppercase tracking-widest text-gray-900 border-b border-gray-900 pb-1 hover:text-primary-ink hover:border-primary transition-colors"
              >
                {t('common.viewCollection')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetails;
