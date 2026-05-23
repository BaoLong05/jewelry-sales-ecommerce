export const flattenLeafCategories = (categories = []) =>
  categories.flatMap((category) => {
    if (Array.isArray(category.children) && category.children.length > 0) {
      return category.children.map((child) => ({
        ...child,
        parent_name: category.name,
      }));
    }

    return [category];
  });
