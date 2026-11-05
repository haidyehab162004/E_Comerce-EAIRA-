/**
 * أسماء الفئات جاية من الداتابيز بالإنجليزي، وبنحوّلها لمفاتيح الترجمة.
 * أي فئة مش معروفة بنعرضها Capitalized زي ما هي.
 */
const categoryKeys = {
  apparel: 'home.category.apparel',
  footwear: 'home.category.footwear',
  homewear: 'home.category.homewear',
  knitwear: 'home.category.knitwear',
  outerwear: 'home.category.outerwear',
  suits: 'home.category.suits',
  pants: 'home.category.pants',
  bags: 'home.category.bags',
  dresses: 'home.category.dresses',
};

export const getCategoryLabel = (category, t) => {
  if (!category) return '';
  const key = categoryKeys[String(category).toLowerCase()];
  if (key) return t(key);
  return String(category).replace(/\b\w/g, (letter) => letter.toUpperCase());
};
