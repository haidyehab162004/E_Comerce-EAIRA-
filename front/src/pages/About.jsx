import { useLanguage } from '../context/useLanguage';

export default function About() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="order-2 border-y border-line-strong bg-surface-alt px-6 py-12 lg:order-1 sm:px-10 sm:py-16">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-ink">{t('about.eyebrow1')}</p>
            <ul className="space-y-4 font-serif text-2xl text-gray-900 sm:text-3xl">
              <li>{t('about.item1')}</li>
              <li>{t('about.item2')}</li>
              <li>{t('about.item3')}</li>
            </ul>
          </div>
          <div className="order-1 py-4 lg:order-2 lg:py-0">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-ink">{t('about.eyebrow2')}</p>
            <h2 className="max-w-xl font-serif text-4xl leading-[1.12] text-gray-950 sm:text-5xl lg:text-6xl">
              {t('about.title')}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-gray-600">
              {t('about.desc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
