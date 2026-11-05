import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import Layout from '../components/Layout';
import ProductImage from '../components/ProductImage';
import coatImg from '../assets/optimized/coat.jpg';
import suitImg from '../assets/optimized/suit.jpg';
import { storeApi } from '../services/api';
import { getEffectivePrice, getRegularPrice, hasValidSalePrice } from '../utils/pricing';
import { getCategoryLabel } from '../utils/categories';
import { useLanguage } from '../context/useLanguage';

const PAGE_SIZE = 9;

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) result.push(`gap-${page}`);
    result.push(page);
  });
  return result;
};

const formatPrice = (price) => new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
}).format(Number(price) || 0);

function ProductCard({ product, onSelect, t }) {
  const productId = product._id || product.id;
  const fallbackImage = /suit/i.test(`${product.category} ${product.name}`) ? suitImg : coatImg;

  return (
    <button
      type="button"
      onClick={() => onSelect(productId)}
      className="group block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      aria-label={t('shop.viewProduct', { name: product.name })}
    >
      <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-surface-muted">
        <ProductImage product={product} fallback={fallbackImage} alt={product.name} />
        {(product.isNewProduct || product.isSale) && (
          <span className="absolute start-3 top-3 bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-800">
            {product.isSale ? t('common.sale') : t('common.new')}
          </span>
        )}
        {Number(product.stockCount) <= 3 && Number(product.stockCount) > 0 && (
          <span className="absolute bottom-3 start-3 bg-surface/95 px-2.5 py-1 text-[10px] font-medium text-gray-700">
            {t('shop.onlyLeft', { count: product.stockCount })}
          </span>
        )}
        {Number(product.stockCount) <= 0 && (
          <span className="absolute bottom-3 start-3 bg-surface/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-600">
            {t('common.soldOut')}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 truncate text-[11px] uppercase tracking-[0.14em] text-gray-500">
            {getCategoryLabel(product.category, t)}
          </p>
          <h2 className="truncate text-sm font-medium text-gray-900 group-hover:text-primary-ink">{product.name}</h2>
        </div>
        <div className="shrink-0 text-end">
          {hasValidSalePrice(product) && <p className="text-xs text-gray-400 line-through">{formatPrice(getRegularPrice(product))}</p>}
          <p className="text-sm font-semibold text-primary-ink">{formatPrice(getEffectivePrice(product))}</p>
        </div>
      </div>
    </button>
  );
}

function ProductSkeleton() {
  return Array.from({ length: PAGE_SIZE }, (_, index) => (
    <div key={index} className="animate-pulse" aria-hidden="true">
      <div className="mb-4 aspect-[3/4] bg-gray-100" />
      <div className="mb-2 h-3 w-1/3 bg-gray-100" />
      <div className="h-4 w-2/3 bg-gray-100" />
    </div>
  ));
}

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';
  const selectedSize = searchParams.get('size') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const categories = [
    { label: t('shop.allProducts'), value: '' },
    { label: t('shop.newArrivals'), value: 'new' },
  ];

  const sortOptions = [
    { label: t('shop.sort.newest'), value: 'newest' },
    { label: t('shop.sort.priceAsc'), value: 'price_asc' },
    { label: t('shop.sort.priceDesc'), value: 'price_desc' },
    { label: t('shop.sort.rating'), value: 'rating' },
  ];

  useEffect(() => {
    let active = true;
    storeApi.getCategories()
      .then((data) => {
        if (active) setAvailableCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setAvailableCategories([]);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        const data = await storeApi.getProducts({
          category: selectedCategory || undefined,
          size: selectedSize || undefined,
          sort: sortBy,
          q: searchQuery.trim() || undefined,
          page,
          limit: PAGE_SIZE,
        });

        if (!active) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotal(Number(data.total) || 0);
        setTotalPages(Math.max(1, Number(data.pages) || 1));
      } catch {
        if (!active) return;
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
        setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => { active = false; };
  }, [selectedCategory, selectedSize, sortBy, searchQuery, page, requestVersion]);

  // لو الرابط فيه رقم صفحة أكبر من عدد الصفحات المتاح (بعد تغيير فلتر مثلًا)
  useEffect(() => {
    if (loading || page <= totalPages) return;
    const next = new URLSearchParams(searchParams);
    if (totalPages > 1) next.set('page', String(totalPages));
    else next.delete('page');
    setSearchParams(next, { replace: true });
  }, [loading, page, totalPages, searchParams, setSearchParams]);

  const updateFilters = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handleProductSelect = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const categoryOptions = [
    ...categories,
    ...availableCategories.map(({ category }) => ({
      label: getCategoryLabel(category, t),
      value: category,
    })),
  ].filter((option, index, options) => options.findIndex((item) => item.value === option.value) === index);

  const clearFilters = () => {
    setSearchParams({});
  };

  const changePage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) next.set('page', String(nextPage));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <Layout>
      <main className="min-h-screen bg-surface">
        <header className="border-b border-line bg-surface-alt">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-ink">{t('shop.eyebrow')}</p>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1 className="font-serif text-4xl text-gray-950 sm:text-5xl">{t('shop.title')}</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                  {t('shop.subtitle')}
                </p>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateFilters({ q: searchInputRef.current?.value.trim() || '' });
                }}
                className="flex w-full max-w-sm items-center border-b border-gray-300 focus-within:border-primary"
                role="search"
              >
                <Search size={17} className="shrink-0 text-gray-500" aria-hidden="true" />
                <input
                  key={searchQuery}
                  ref={searchInputRef}
                  defaultValue={searchQuery}
                  placeholder={t('shop.searchPlaceholder')}
                  aria-label={t('shop.searchAria')}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button type="button" onClick={() => updateFilters({ q: '' })} aria-label={t('shop.clearSearch')} className="p-2 text-gray-500 hover:text-gray-900">
                    <X size={15} />
                  </button>
                )}
              </form>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-gray-500">
              <Filter size={15} aria-hidden="true" />
              <span>{loading ? t('shop.loadingCollection') : t('shop.itemsCount', { count: total })}</span>
              {(selectedCategory || selectedSize || searchQuery) && (
                <button onClick={clearFilters} className="ms-2 inline-flex items-center gap-1 text-primary-ink underline underline-offset-4">
                  {t('common.clearFilters')} <X size={12} />
                </button>
              )}
            </div>
            <label className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-gray-500">
              {t('shop.sortBy')}
              <span className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => updateFilters({ sort: event.target.value })}
                  aria-label={t('shop.sortAria')}
                  className="appearance-none bg-transparent py-2 pe-7 text-xs font-semibold text-gray-900 outline-none"
                >
                  {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute end-1 top-1/2 -translate-y-1/2 text-gray-700" />
              </span>
            </label>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
            <aside className="grid min-w-0 gap-5 sm:grid-cols-2 lg:block lg:space-y-8">
              <section aria-labelledby="category-heading" className="min-w-0 sm:col-span-2 lg:col-span-1">
                <h2 id="category-heading" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-900">{t('shop.category')}</h2>
                <ul className="flex min-w-0 flex-wrap gap-x-5 gap-y-3 lg:flex-col lg:gap-3">
                  {categoryOptions.map(({ label, value }) => (
                    <li key={value || 'all'}>
                      <button
                        type="button"
                        aria-pressed={selectedCategory === value}
                        onClick={() => updateFilters({ category: value })}
                        className={`text-sm transition-colors ${selectedCategory === value ? 'font-semibold text-primary-ink' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="size-heading" className="min-w-0 border-t border-line pt-4 sm:border-0 sm:pt-0 lg:border-t lg:pt-6">
                <h2 id="size-heading" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-900">{t('shop.size')}</h2>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-3 lg:grid-cols-3">
                  {sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      aria-pressed={selectedSize === size}
                      onClick={() => updateFilters({ size: selectedSize === size ? '' : size })}
                      className={`border py-2 text-xs transition-colors ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-line-strong text-gray-600 hover:border-primary hover:text-primary-ink'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>
            </aside>

            <section aria-label={t('shop.productsAria')} aria-busy={loading}>
              {error ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <p className="max-w-md text-sm text-gray-600">{t('shop.loadError')}</p>
                  <button type="button" onClick={() => setRequestVersion((version) => version + 1)} className="mt-4 text-sm font-semibold text-primary-ink underline underline-offset-4">
                    {t('common.tryAgain')}
                  </button>
                </div>
              ) : loading ? (
                <>
                  <p className="mb-4 text-xs text-gray-500">{t('shop.loadingCollection')}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                    <ProductSkeleton />
                  </div>
                </>
              ) : products.length ? (
                <>
                  <p className="mb-4 text-xs text-gray-500">
                    {t('shop.range', { from: rangeStart, to: rangeEnd, total })}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
                    {products.map((product) => (
                      <ProductCard key={product._id || product.id} product={product} onSelect={handleProductSelect} t={t} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <nav aria-label={t('shop.pagesAria')} className="mt-12 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => changePage(page - 1)}
                        aria-label={t('shop.prevPage')}
                        className="flex h-10 w-10 items-center justify-center border border-line-strong text-gray-700 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isRtl ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
                      </button>
                      {pageNumbers.map((pageNumber) => (
                        typeof pageNumber === 'number' ? (
                          <button
                            type="button"
                            key={pageNumber}
                            aria-current={page === pageNumber ? 'page' : undefined}
                            onClick={() => changePage(pageNumber)}
                            className={`h-10 min-w-10 border px-3 text-xs font-semibold transition-colors ${page === pageNumber ? 'border-primary bg-primary text-white' : 'border-line-strong text-gray-700 hover:border-primary'}`}
                          >
                            {pageNumber}
                          </button>
                        ) : (
                          <span key={pageNumber} className="px-1 text-sm text-gray-400" aria-hidden="true">…</span>
                        )
                      ))}
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => changePage(page + 1)}
                        aria-label={t('shop.nextPage')}
                        className="flex h-10 w-10 items-center justify-center border border-line-strong text-gray-700 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isRtl ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <p className="font-serif text-2xl text-gray-900">{t('shop.noProducts')}</p>
                  <p className="mt-2 text-sm text-gray-500">{t('shop.noProductsHint')}</p>
                  <button type="button" onClick={clearFilters} className="mt-5 text-sm font-semibold text-primary-ink underline underline-offset-4">{t('common.clearFilters')}</button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProductListing;
