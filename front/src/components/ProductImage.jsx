import { useState } from 'react';
import { getImageUrl } from '../services/api';

/**
 * صورة منتج مع معاينة الصورة الثانية عند المرور بالماوس.
 * ------------------------------------------------------------------
 * - الصورة الأساسية product.image، والصورة الثانية أول عنصر في product.images
 *   مختلف عنها.
 * - لو مفيش صورة ثانية، بنعمل تكبير خفيف (zoom) عند الهوفر بدل التبديل.
 * - الحاوية لازم تكون relative و group (أو الأب يكون group).
 */
export default function ProductImage({
  product,
  fallback = '',
  alt = '',
  imageClassName = '',
  loading = 'lazy',
  hoverScale = 'group-hover:scale-[1.04]',
}) {
  const extraImages = Array.isArray(product?.images) ? product.images : [];
  const secondarySource = extraImages.find(
    (image) => image && image !== product?.image,
  );
  const secondary = getImageUrl(secondarySource);
  const primarySource = getImageUrl(product?.image) || fallback;
  const [failed, setFailed] = useState(false);
  const primary = failed && fallback ? fallback : primarySource;

  const primaryClasses = secondary
    ? 'transition-opacity duration-500 group-hover:opacity-0'
    : `transition-transform duration-500 ${hoverScale}`;

  return (
    <>
      <img
        src={primary}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${primaryClasses} ${imageClassName}`}
      />
      {secondary && (
        <img
          src={secondary}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${imageClassName}`}
        />
      )}
    </>
  );
}
