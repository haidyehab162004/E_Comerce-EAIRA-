export const hasValidSalePrice = (product) => (
  Boolean(product?.isSale)
  && (
    (Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.price))
    || Number(product.originalPrice) > Number(product.price)
  )
);

export const getEffectivePrice = (product) => (
  hasValidSalePrice(product) && Number(product.salePrice) > 0
    ? Number(product.salePrice)
    : Number(product?.price) || 0
);

export const getRegularPrice = (product) => (
  hasValidSalePrice(product) && Number(product.originalPrice) > Number(product.price)
    ? Number(product.originalPrice)
    : Number(product?.price) || 0
);
