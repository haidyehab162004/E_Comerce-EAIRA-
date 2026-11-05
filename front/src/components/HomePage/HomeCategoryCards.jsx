import { Link } from 'react-router-dom';
import pantsImage from '../../assets/grey_pants.png';
import bagsImage from '../../assets/accessories_red.png';
import dressesImage from '../../assets/optimized/formal_dress.jpg';
import { useLanguage } from '../../context/useLanguage';

export default function HomeCategoryCards() {
  const { t } = useLanguage();

  const categories = [
    { name: t('home.category.pants'), value: 'Pants', image: pantsImage },
    { name: t('home.category.bags'), value: 'Bags', image: bagsImage },
    { name: t('home.category.dresses'), value: 'Dresses', image: dressesImage },
  ];

  return (
    <nav aria-label={t('home.shopByCategory')} className="mx-auto max-w-7xl px-4 pb-2 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:justify-center sm:gap-3 sm:px-0">
        {categories.map((category) => (
          <Link
            key={category.value}
            to={`/shop?category=${encodeURIComponent(category.value)}`}
            className="group flex w-[112px] shrink-0 snap-start flex-col items-center gap-2 rounded-md border border-line bg-surface px-3 py-3 transition hover:border-primary sm:w-[124px] sm:py-4"
          >
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-line-strong p-1">
              <img src={category.image} alt="" loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </span>
            <span className="text-center text-[11px] font-medium text-gray-800">{category.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
