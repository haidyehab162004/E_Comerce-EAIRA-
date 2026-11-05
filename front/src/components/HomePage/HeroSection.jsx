import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../Icons';
import { useLanguage } from '../../context/useLanguage';

export default function HeroSection() {
  const storyTrackRef = useRef(null);
  const { t, isRtl } = useLanguage();

  const womenLooks = [
    {
      image: '/images/optimized/women-fashion-outfit.jpg',
      alt: t('hero.alt1'),
      title: t('hero.title1'),
      detail: t('hero.detail1'),
      position: 'object-[center_42%]',
    },
    {
      image: '/images/optimized/womens.jpg',
      alt: t('hero.alt2'),
      title: t('hero.title2'),
      detail: t('hero.detail2'),
      position: 'object-[center_38%]',
    },
    {
      image: '/images/optimized/women-back.jpg',
      alt: t('hero.alt3'),
      title: t('hero.title3'),
      detail: t('hero.detail3'),
      position: 'object-[center_38%]',
    },
  ];

  useEffect(() => {
    const track = storyTrackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const autoplay = window.setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const position = isRtl ? Math.abs(track.scrollLeft) : track.scrollLeft;
      const atLastStory = position >= maxScroll - 8;
      track.scrollTo({
        left: atLastStory ? 0 : track.scrollLeft + (isRtl ? -track.clientWidth : track.clientWidth),
        behavior: 'smooth',
      });
    }, 5000);

    return () => window.clearInterval(autoplay);
  }, [isRtl]);

  const scrollStory = (direction) => {
    const track = storyTrackRef.current;
    if (!track) return;
    const step = isRtl ? -direction : direction;
    track.scrollBy({ left: step * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div>
      <section aria-label={t('hero.aria')} className="relative bg-stories">
        <div
          ref={storyTrackRef}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={t('hero.scrollAria')}
        >
          {womenLooks.map((look, index) => (
            <article key={look.title} className="group relative isolate flex h-[calc(100svh-5rem)] min-h-[520px] max-h-[900px] w-full shrink-0 snap-start items-end overflow-hidden bg-line-strong sm:min-h-[600px]">
              <img
                src={look.image}
                alt={look.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding={index === 0 ? 'sync' : 'async'}
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.02] ${look.position}`}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="relative z-10 w-full px-6 pb-12 pt-32 text-white sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
                <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">{look.title}</h1>
                <p className="mt-3 text-sm text-white/85 sm:text-base">{look.detail}</p>
                <Link to="/shop" className="mt-7 inline-flex items-center gap-3 bg-surface px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-950 transition hover:bg-surface-alt">
                  {t('hero.explore')} <ArrowRight size={15} className={isRtl ? 'rotate-180' : ''} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <button
          type="button"
          aria-label={t('hero.prev')}
          onClick={() => scrollStory(-1)}
          className="absolute start-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/60 text-white transition hover:bg-surface hover:text-gray-950 sm:start-8"
        >
          <ArrowRight size={16} className={isRtl ? '' : 'rotate-180'} />
        </button>

        <button
          type="button"
          aria-label={t('hero.next')}
          onClick={() => scrollStory(1)}
          className="absolute end-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/60 text-white transition hover:bg-surface hover:text-gray-950 sm:end-8"
        >
          <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
        </button>
      </section>
    </div>
  );
 }
