import { Banknote, ClipboardCheck, HeartHandshake, PackageCheck } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';

export default function TrustBadges() {
  const { t } = useLanguage();

  const benefits = [
    { Icon: PackageCheck, title: t('trust.1.title'), detail: t('trust.1.detail') },
    { Icon: Banknote, title: t('trust.2.title'), detail: t('trust.2.detail') },
    { Icon: ClipboardCheck, title: t('trust.3.title'), detail: t('trust.3.detail') },
    { Icon: HeartHandshake, title: t('trust.4.title'), detail: t('trust.4.detail') },
  ];

  return (
    <section aria-label={t('trust.aria')} className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {benefits.map(({ Icon, title, detail }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon size={23} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gray-800" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-gray-500">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
