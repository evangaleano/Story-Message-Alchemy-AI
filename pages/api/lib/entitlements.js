/**
 * Entitlements helper — verify user purchases server-side
 * NEVER trust client-side entitlement flags alone
 */

export function canAccessProduct(user, productId) {
  if (!user || !user.purchases) {
    return false;
  }

  const { purchases } = user;

  // Individual product access ($17 each)
  if (purchases[`product_${productId}`]) {
    return true;
  }

  // Bundle access ($37 for all three)
  if (purchases.bundle_3ai) {
    return true;
  }

  return false;
}

export function getAccessibleProducts(user) {
  if (!user || !user.purchases) {
    return [];
  }

  const accessible = [];

  for (let i = 1; i <= 3; i++) {
    if (canAccessProduct(user, i)) {
      accessible.push(i);
    }
  }

  return accessible;
}

export function canAccessBook(user) {
  return user && user.purchases && (user.purchases.book === true);
}

export function getProductInfo(productId) {
  const products = {
    1: {
      id: 1,
      name: 'Story-Driven Message',
      subtitle: 'Know Your Story',
      description: 'Help the founder extract the story that initiated them into becoming the guide.',
      price: 17,
    },
    2: {
      id: 2,
      name: 'Conversion Client Impact Story',
      subtitle: 'Prove Your Impact',
      description: 'Help the founder turn a real client transformation into proof that their remedy works.',
      price: 17,
    },
    3: {
      id: 3,
      name: 'Story-Driven Offer',
      subtitle: 'Build the Offer That Connects Them',
      description: 'Use the founder\'s story + proven transformation to create a credible offer.',
      price: 17,
    },
  };

  return products[productId] || null;
}

export default {
  canAccessProduct,
  getAccessibleProducts,
  canAccessBook,
  getProductInfo,
};
