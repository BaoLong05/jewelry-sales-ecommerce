export function getDiscountInfo(product) {
  const now = new Date();

  const discounts = Array.isArray(product.discounts)
    ? product.discounts
    : [];

  const discount = discounts.find((d) => {
    if (!d?.start_date || !d?.end_date) return false;

    const start = new Date(d.start_date);
    const end = new Date(d.end_date);

    return start <= now && end >= now;
  });

  const originalPrice = Number(product.price || 0);

  if (!discount) {
    return {
      discountedPrice: originalPrice,
      originalPrice,
      discountAmount: 0,
      badge: null,
      hasFreeship: false,
      discount: null,
    };
  }

  let discountedPrice = originalPrice;
  let badge = null;
  let hasFreeship = false;

  switch (discount.type) {
    case "percent":
      discountedPrice =
        originalPrice * (1 - Number(discount.value || 0) / 100);

      badge = {
        text: `-${discount.value}%`,
        color: "rose",
      };
      break;

    case "fixed":
      discountedPrice = Math.max(
        0,
        originalPrice - Number(discount.value || 0),
      );

      badge = {
        text: `-${Number(discount.value).toLocaleString("vi-VN")}₫`,
        color: "rose",
      };
      break;

    case "freeship":
      hasFreeship = true;

      badge = {
        text: "Freeship",
        color: "green",
      };
      break;

    default:
      break;
  }

  return {
    discountedPrice,
    originalPrice,
    discountAmount: originalPrice - discountedPrice,
    badge,
    hasFreeship,
    discount,
  };
}