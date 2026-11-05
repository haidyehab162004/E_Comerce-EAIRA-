import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';

const socialIcons = [FaFacebookF, FaTiktok, FaWhatsapp, FaInstagram];

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-line bg-surface-alt text-ink-soft">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="flex flex-col gap-9 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <Link to="/" aria-label={t('nav.homeAria')} className="inline-flex items-center gap-3 text-ink">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-serif text-2xl text-white">A</span>
              <span>
                <span className="block text-xl font-semibold tracking-wide">AEIRA</span>
                <span className="mt-0.5 block text-[8px] uppercase tracking-[0.5em] text-muted">Fashion</span>
              </span>
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted">
              {t('footer.desc')}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/shop" className="rounded-full border border-line-strong bg-surface/60 px-4 py-2 text-xs transition hover:border-primary hover:text-primary-ink">{t('footer.shopAll')}</Link>
              <Link to="/about" className="rounded-full border border-line-strong bg-surface/60 px-4 py-2 text-xs transition hover:border-primary hover:text-primary-ink">{t('footer.ourStory')}</Link>
            </div>
          </div>

          <div className="sm:pt-1">
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{t('footer.connect')}</h2>
            <div className="flex items-center gap-3" aria-label={t('footer.socialAria')}>
              {socialIcons.map((Icon, index) => (
                <span key={index} className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface/50 text-ink-soft" aria-hidden="true">
                  <Icon size={17} strokeWidth={1.7} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-line-strong pt-5 text-center text-xs text-muted">
          {t('footer.rights', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
