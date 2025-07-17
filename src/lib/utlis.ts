import { PriceHistoryItem, Product } from "@/types";

const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = element.text().trim();

    if (priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, "");

      let firstPrice;

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      }

      return firstPrice || cleanPrice;
    }
  }
  return "";
}

export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any) {
  // these are possible elements holding description of the product
  const selectors = [".a-unordered-list .a-list-item", ".a-expander-content p"];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }
  return "";
}

export function extractContent($: any) {
  const parentDiv = $("#__next"); // Replace "parent-selector" with the appropriate selector for the parent div

  if (parentDiv.length > 0) {
    const thirdChildDiv = parentDiv.find("div:nth-child(3)"); // Target the third child div within the parent div

    if (thirdChildDiv.length > 0) {
      const content = thirdChildDiv.html(); // Get the HTML content of the third child div
      return content;
    }
  }

  return "";
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

// Enhanced price extraction from PriceHistoryApp
export async function getEnhancedPriceData(productSlug: string | null) {
  try {
    // If no slug provided, return null
    if (!productSlug) {
      return null;
    }

    const priceHistoryUrl = `https://pricehistoryapp.com/product/${productSlug}`;

    const response = await fetch(priceHistoryUrl);
    const html = await response.text();

    // Extract JSON data from the page
    const jsonMatch = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([^<]*)<\/script>/
    );
    if (!jsonMatch) {
      return null;
    }

    const jsonData = JSON.parse(jsonMatch[1]);
    const productData = jsonData.props.pageProps.ogProduct;

    // Calculate buying recommendation
    const currentPrice = productData.price;
    const lowestPrice = productData.lowest_price;
    const averagePrice = productData.average_price;
    const discount = productData.discount;
    const dropChances = productData.drop_chances;

    // Logic for buying recommendation
    let buyingRecommendation = "";
    let recommendationType = "";

    if (currentPrice <= lowestPrice * 1.05) {
      // Current price is within 5% of lowest price
      buyingRecommendation =
        "🟢 Excellent time to buy! Price is at or near its lowest.";
      recommendationType = "excellent";
    } else if (currentPrice <= averagePrice * 0.9) {
      // Current price is 10% below average
      buyingRecommendation = "🟢 Good time to buy! Price is below average.";
      recommendationType = "good";
    } else if (discount >= 20) {
      // Good discount available
      buyingRecommendation = "🟡 Decent time to buy! Good discount available.";
      recommendationType = "decent";
    } else if (dropChances >= 70) {
      // High chance of price drop
      buyingRecommendation =
        "🔴 Consider waiting! High chance of price drop soon.";
      recommendationType = "wait";
    } else if (currentPrice >= averagePrice * 1.1) {
      // Price is 10% above average
      buyingRecommendation = "🔴 Consider waiting! Price is above average.";
      recommendationType = "wait";
    } else {
      // Neutral situation
      buyingRecommendation = "🟡 Moderate time to buy. Price is average.";
      recommendationType = "moderate";
    }

    return {
      currentPrice: productData.price,
      lowestPrice: productData.lowest_price,
      highestPrice: productData.highest_price,
      averagePrice: productData.average_price,
      discount: productData.discount,
      dropChances: productData.drop_chances,
      inStock: productData.in_stock,
      store: productData.store.name,
      category: productData.category.name,
      rating: productData.rating,
      ratingCount: productData.rating_count,
      // New buying recommendation features
      buyingRecommendation,
      recommendationType,
      // Enhanced product details
      productId: productData.id,
      productSlug: productData.slug,
      productImage: productData.image,
      mrp: productData.mrp,
      isPrime: productData.is_prime,
      features: productData.features || [],
      // Store details
      storeSlug: productData.store.slug,
      storeImage: productData.store.image,
      storePrimeImage: productData.store.prime_image,
      // Country/Currency info
      currencyIcon: productData.country?.currency_icon || "₹",
      countryCode: productData.country?.country_code || "IN",
      // Data freshness - when was the data last updated
      priceFetchedAt: productData.price_fetched_at,
      historyFetchedAt: productData.history_fetched_at,
      updatedAt: productData.updated_at,
      // Additional insights
      priceDrops: productData.price_drops || 0,
      priceRises: productData.price_rises || 0,
      totalPriceChanges:
        (productData.price_drops || 0) + (productData.price_rises || 0),
      // Similar products data
      similarDealsCount: productData.similar_deals?.length || 0,
      similarProductsCount: productData.similar_products?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching enhanced price data:", error);
    return null;
  }
}
