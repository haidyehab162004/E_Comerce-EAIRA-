import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag, LogOut, Heart, User, ChevronDown, LayoutDashboard,
  Home, Store, Sun, Moon, Globe,
} from './Icons';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { useWishlist } from '../context/useWishlist';
import { useTheme } from '../context/useTheme';
import { useLanguage } from '../context/useLanguage';

const Navbar = () => {
  const { cartCount, clearCart } = useCart();
  const { isLoggedIn, isAdmin, userName, logout } = useAuth();
  const { wishlistCount, clearWishlist } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const { lang, t, toggleLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => {
    clearCart();
    clearWishlist();
    logout();
    setDropdownOpen(false);
    setAccountSheetOpen(false);
  };

  // إغلاق الـ dropdown لما يضغط بره
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/product/random', label: t('nav.productDetails') },
  ];

  const isActive = (to) => {
    if (to === '/product/random') {
      return location.pathname.startsWith('/product/');
    }
    const [path, query] = to.split('?');
    if (path === '/') return location.pathname === '/';
    if (!query) return location.pathname === path && !location.search;
    return location.pathname === path && location.search === `?${query}`;
  };

  const accountHref = isLoggedIn ? null : '/login';

  // عناصر الشريط السفلي
  const tabs = [
    { key: 'home', to: '/', label: t('nav.home'), icon: Home, active: location.pathname === '/' },
    {
      key: 'shop',
      to: '/shop',
      label: t('nav.shop'),
      icon: Store,
      active: location.pathname === '/shop' || location.pathname === '/products',
    },
  ];

  if (!isAdmin) {
    tabs.push({
      key: 'wishlist',
      to: '/wishlist',
      label: t('nav.saved'),
      icon: Heart,
      badge: wishlistCount,
      active: location.pathname === '/wishlist',
    });
    tabs.push({
      key: 'cart',
      to: '/cart',
      label: t('nav.bag'),
      icon: ShoppingBag,
      badge: cartCount,
      active: location.pathname === '/cart',
    });
  } else {
    tabs.push({
      key: 'admin',
      to: '/admin',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      active: location.pathname.startsWith('/admin'),
    });
  }

  const badge = (count) =>
    count > 0 && (
      <span className="absolute -top-1 end-1 min-w-[16px] h-4 rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-white">
        {count > 99 ? '99+' : count}
      </span>
    );

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[76px] items-center justify-between">

            <div className="flex shrink-0 items-center">
              <Link
                to="/"
                aria-label={t('nav.homeAria')}
                className="font-serif text-2xl font-bold tracking-[0.2em] text-primary-ink transition-opacity hover:opacity-75"
              >
                AEIRA
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-5 lg:flex xl:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    isActive(link.to)
                      ? 'border-b border-primary pb-1 text-primary-ink'
                      : 'text-gray-500 hover:text-primary-ink'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Language toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={lang === 'ar' ? t('nav.switchToEnglish') : t('nav.switchToArabic')}
                title={lang === 'ar' ? t('nav.switchToEnglish') : t('nav.switchToArabic')}
                className="flex h-9 items-center gap-1 rounded-full px-2 text-muted transition-colors hover:bg-surface-muted hover:text-primary-ink"
              >
                <Globe size={17} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'AR' : 'EN'}
                </span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
                title={isDark ? t('nav.lightMode') : t('nav.darkMode')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-primary-ink"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {isLoggedIn ? (
                <>
                  {/* Wishlist Icon — hidden for admin */}
                  {!isAdmin && (
                    <Link
                      to="/wishlist"
                      className="relative hidden p-2 text-muted transition-colors hover:text-primary-ink lg:block"
                      title={t('nav.wishlist')}
                    >
                      <Heart size={20} />
                      {badge(wishlistCount)}
                    </Link>
                  )}

                  {/* Cart Icon — hidden for admin */}
                  {!isAdmin && (
                    <Link
                      to="/cart"
                      className="relative hidden p-2 text-muted transition-colors hover:text-primary-ink lg:block"
                      title={t('nav.shoppingBag')}
                    >
                      <ShoppingBag size={20} />
                      {badge(cartCount)}
                    </Link>
                  )}

                  {/* User Dropdown — desktop only */}
                  <div className="relative hidden lg:block" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-gray-700 transition-colors hover:text-primary-ink"
                    >
                      <User size={16} />
                      <span className="max-w-24 truncate text-[10px] uppercase tracking-widest">{userName}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute end-0 top-full z-50 mt-2 w-48 border border-line bg-surface py-1 shadow-xl">
                        {!isAdmin && (
                          <>
                            <Link
                              to="/wishlist"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-widest text-muted transition-colors hover:bg-surface-muted"
                            >
                              <span className="flex items-center gap-2"><Heart size={13} /> {t('nav.wishlist')}</span>
                              {wishlistCount > 0 && (
                                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  {wishlistCount}
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/cart"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-widest text-muted transition-colors hover:bg-surface-muted"
                            >
                              <span className="flex items-center gap-2"><ShoppingBag size={13} /> {t('nav.bag')}</span>
                              {cartCount > 0 && (
                                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  {cartCount}
                                </span>
                              )}
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-widest text-muted transition-colors hover:bg-surface-muted"
                          >
                            <LayoutDashboard size={13} /> {t('nav.dashboard')}
                          </Link>
                        )}

                        <div className="mt-1 border-t border-line pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-widest text-red-500 transition-colors hover:bg-red-50"
                          >
                            <LogOut size={13} /> {t('nav.logout')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Auth Button — not logged in, desktop only */
                <div className="hidden items-center space-x-2 lg:flex">
                  <Link
                    id="login-btn"
                    to="/login"
                    className="bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-light"
                  >
                    {t('nav.login')}
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* ===== شريط التنقل السفلي (موبايل + تابلت) ===== */}
      <nav
        aria-label={t('nav.primaryAria')}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.key}
                to={tab.to}
                aria-current={tab.active ? 'page' : undefined}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors ${
                  tab.active ? 'text-primary-ink' : 'text-muted hover:text-primary-ink'
                }`}
              >
                <span className="relative">
                  <TabIcon size={21} />
                  {badge(tab.badge || 0)}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`absolute inset-x-4 top-0 h-0.5 rounded-full transition-opacity ${
                    tab.active ? 'bg-primary opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            );
          })}

          {accountHref ? (
            <Link
              id="mobile-login-btn"
              to={accountHref}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors ${
                location.pathname === '/login'
                  ? 'text-primary-ink'
                  : 'text-muted hover:text-primary-ink'
              }`}
            >
              <User size={21} />
              <span>{t('nav.account')}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAccountSheetOpen(true)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide text-muted transition-colors hover:text-primary-ink"
            >
              <User size={21} />
              <span>{t('nav.account')}</span>
            </button>
          )}
        </div>
      </nav>

      {/* ===== شيت الحساب (موبايل) ===== */}
      {accountSheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setAccountSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.accountMenu')}
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-surface px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
            style={{ animation: 'sheetUp 0.22s ease-out' }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" />
            <p className="text-[10px] uppercase tracking-widest text-muted">{t('nav.signedInAs')}</p>
            <p className="mb-4 truncate text-base font-semibold text-ink">{userName}</p>

            <div className="space-y-1">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setAccountSheetOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  <LayoutDashboard size={18} /> {t('nav.dashboard')}
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/wishlist"
                  onClick={() => setAccountSheetOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  <Heart size={18} /> {t('nav.wishlist')}
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/cart"
                  onClick={() => setAccountSheetOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  <ShoppingBag size={18} /> {t('nav.bag')}
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} /> {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
