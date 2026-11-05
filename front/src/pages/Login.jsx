import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { useLanguage } from '../context/useLanguage';
import Navbar from '../components/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  const { t, isRtl } = useLanguage();

  const [isLogin, setIsLogin] = useState(!location.state?.register);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading]   = useState(false);

  // Pop animation state
  const [popKey, setPopKey] = useState(0);

  // Re-trigger pop animation when switching between login/register
  const handleToggle = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setPopKey(prev => prev + 1);
  };

  const continueAfterLogin = () => {
    const destination = location.state?.from;
    if (destination?.pathname?.startsWith('/') && !destination.pathname.startsWith('//')) {
      navigate(destination);
      return;
    }
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        // تسجيل الدخول
        const res = await authApi.login({ email, password });
        login(res); // استخدام AuthContext بدل localStorage مباشرة

        // لو isAdmin → توجيه للداشبورد
        if (res.isAdmin) {
          toast.success(t('login.welcomeAdmin'));
          navigate('/admin');
        } else {
          toast.success(t('login.signedIn'));
          continueAfterLogin();
        }
      } else {
        // إنشاء حساب جديد — الحقول: name, email, password
        const res = await authApi.register({ name, email, password });
        login(res); // استخدام AuthContext
        toast.success(t('login.created'));
        continueAfterLogin();
      }
    } catch (err) {
      setErrorMsg(err.message || t('login.genericError'));
      toast.error(err.message || t('login.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Navbar />

      <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-surface-alt px-4 py-8 sm:px-8 sm:py-12">
        <div key={popKey} className="login-card relative z-10 grid w-full max-w-5xl overflow-hidden rounded-sm bg-surface-warm shadow-lg lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-primary p-7 text-white sm:p-10 lg:min-h-full lg:p-12">
            <div className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
              {t('login.accountTag')}
            </div>
            <div className="relative z-10 mt-12 lg:mt-0">
              <p className="mb-4 font-serif text-lg italic text-on-primary">{t('login.welcome')}</p>
              <h1 className="max-w-sm font-serif text-4xl leading-[1.12] sm:text-5xl">
                {t('login.everyday')}
                <br />
                <span className="text-on-primary">{t('login.elevated')}</span>
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
                {isLogin ? t('login.signInIntro') : t('login.registerIntro')}
              </p>
            </div>
            <div className="relative z-10 mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/55 lg:mt-0">
              <span className="h-px w-8 bg-surface/40" />
              {t('login.timeless')}
            </div>
          </section>

          <section className="flex items-center px-6 py-10 sm:px-12 sm:py-14 lg:px-16">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <Link to="/" className="mb-8 inline-block font-serif text-2xl font-bold tracking-[0.2em] text-primary-ink">
                  AEIRA
                </Link>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  {isLogin ? t('login.wardrobe') : t('login.join')}
                </p>
                <h2 className="font-serif text-3xl text-gray-950 sm:text-4xl">
                  {isLogin ? t('login.welcomeBack') : t('login.createAccount')}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {isLogin ? t('login.signInHint') : t('login.registerHint')}
                </p>
              </div>

              {errorMsg && (
                <div role="alert" className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label htmlFor="account-name" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-700">{t('login.name')}</label>
                    <div className="relative">
                      <input
                        id="account-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={t('login.namePlaceholder')}
                        className="w-full border border-line bg-surface px-4 py-3.5 pe-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-focus focus:ring-2 focus:ring-focus/10"
                      />
                      <User aria-hidden="true" className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="account-email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-700">{t('login.email')}</label>
                  <div className="relative">
                    <input
                      id="account-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t('login.emailPlaceholder')}
                      className="w-full border border-line bg-surface px-4 py-3.5 pe-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-focus focus:ring-2 focus:ring-focus/10"
                    />
                    <Mail aria-hidden="true" className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  </div>
                </div>

                <div>
                  <label htmlFor="account-password" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-700">{t('login.password')}</label>
                  <div className="relative">
                    <input
                      id="account-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t('login.passwordPlaceholder')}
                      className="w-full border border-line bg-surface px-4 py-3.5 pe-20 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-focus focus:ring-2 focus:ring-focus/10"
                    />
                    <Lock aria-hidden="true" className="absolute end-12 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition hover:text-primary-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition duration-200 hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? t('login.pleaseWait') : (isLogin ? t('login.signIn') : t('login.createAccountBtn'))}
                  {!loading && <ArrowRight size={16} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />}
                </button>
              </form>

              <div className="mt-7 border-t border-line pt-6 text-center text-sm text-gray-500">
                {isLogin ? t('login.noAccount') : t('login.haveAccount')}
                <button
                  type="button"
                  onClick={handleToggle}
                  className="ms-2 font-semibold text-primary-ink underline decoration-line-strong underline-offset-4 transition hover:text-focus"
                >
                  {isLogin ? t('login.signUp') : t('login.signIn')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
