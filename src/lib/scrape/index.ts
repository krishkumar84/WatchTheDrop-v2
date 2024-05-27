"use server";
import axios from "axios";
import * as cheerio from "cheerio";
import { extractContent, extractCurrency, extractDescription, extractPrice } from "../utlis";
import { getJson } from "serpapi";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import Product from "@/models/product.model";
interface Product {
  position: number;
  title: string;
  link: string;
  product_link: string;
  product_id: string;
  serpapi_product_api: string;
  source: string;
  price: string;
  extracted_price: number;
  second_hand_condition?: string;
  rating?: number;
  reviews?: number;
  extensions: any[];
  thumbnail: string;
  delivery: string;
}

import { redis } from "../../app/config/ratelimit";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";


const ratelimit = new Ratelimit({ 
  redis: redis, 
  limiter: Ratelimit.fixedWindow(4, '100s'), 
});

export async function scrapeAmazonProducts(url: string) {
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $(".a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    // console.log(title,currentPrice,originalPrice)

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'))
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
    
    const description = extractDescription($)
    const fullurl = await getGoogleresult(title);
    const parts = fullurl.split('/');
    const geturl = parts.slice(4).join('/');

    const data = {
        url,
        geturl,
        currency: currency || '$',
        image: imageUrls[0],
        title,
        currentPrice: Number(currentPrice) || Number(originalPrice),
        originalPrice: Number(originalPrice) || Number(currentPrice),
        priceHistory: [],
        discountRate: Number(discountRate),
        category: 'category',
        reviewsCount:100,
        stars: 4.5,
        isOutOfStock: outOfStock,
        description,
        lowestPrice: Number(currentPrice) || Number(originalPrice),
        highestPrice: Number(originalPrice) || Number(currentPrice),
        averagePrice: Number(currentPrice) || Number(originalPrice),
      }

      console.log(data)


      return data;
  } catch (error: any) {
    throw new Error(`error in fetching product ${error.message}`);
  }
}

export async function googleProductSave(ProductGoogle:Product){
  console.log(Product)
  try {
    connectToDB();
    const fullurl = await getGoogleresult(ProductGoogle.title);
    const parts = fullurl.split('/');
    const geturl = parts.slice(4).join('/');
    console.log(geturl);
    
    const data = {
      url:ProductGoogle.link,
      geturl,
      currency: '₹',
      image: ProductGoogle.thumbnail,
      title:ProductGoogle.title,
      currentPrice: ProductGoogle.extracted_price,
      originalPrice: ProductGoogle.extracted_price,
      priceHistory: [],
      discountRate: ProductGoogle.extracted_price + 1000,
      category: "Tech",
      reviewsCount:ProductGoogle.reviews,
      stars: ProductGoogle.rating,
      isOutOfStock: false,
      description:ProductGoogle.title,
      lowestPrice: ProductGoogle.extracted_price -1000,
      highestPrice: (ProductGoogle.extracted_price + 1000),
      averagePrice: ProductGoogle.extracted_price,
    }

    let product = data;

      const existingProduct = await Product.findOne({ url: product.url });

      if (existingProduct) {
          const updatedPriceHistory: any = [
              ...existingProduct.priceHistory,
              { price: product.currentPrice }
          ];

          product = {
              ...product,
              priceHistory: updatedPriceHistory,
              lowestPrice: ProductGoogle.extracted_price,
              highestPrice: ProductGoogle.extracted_price,
              averagePrice: ProductGoogle.extracted_price,
          };
      }

      const newProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { upsert: true, new: true }
      );
      const redirectUrl = newProduct._id.toString();
      revalidatePath(`/products/${redirectUrl}`);
      revalidatePath("/", "layout");
      console.log(redirectUrl)
      return  redirectUrl ; 
    
    // Handle the response data as needed
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }

}
export async function googleShoppingResult(title: string) {
  const ip = headers().get("x-forwarded-for") ;
  console.log(ip);
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip!);
  console.log(success, pending, limit, reset, remaining);
  
  if (!success) {
    // Router.push("/blocked");
    return {error: "bhai ab try mt kr"};
  }
  
  try {
    const json = await getJson({
        engine: "google_shopping",
        q: `${title}`, 
        location: "India", 
        hl: "en", 
        gl: "in",
        api_key: process.env.API_KEY,
        num: 30,
    });

    // //  console.log(json["shopping_results"])
    // console.log(json);
    //  console.log(json["related_shopping_results"]);
    // console.log(json["related_searches"]);
     return json["shopping_results"];
} catch (error) {
    console.error("Error occurred while scraping:", error);
}
}


export async function getGoogleresult(title:string) {
  const ip = headers().get("x-forwarded-for") ;
  console.log(ip);
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip!);
  console.log(success, pending, limit, reset, remaining);
  
  if (!success) {
    // Router.push("/blocked");
    return {error: "bhai ab try mt kr"};
  }
  
  
  try {
    console.log(title)
    
    const titleWords = title.split(' ');
    let query = titleWords.slice(0, 7).join(' ');

    query = query.replace(/[,|]/g, '');

    query = query.replace(/\s+/g, '-');

console.log(query); 
    const searchTerm = `${encodeURIComponent(query)}%20site:pricehistoryapp.com`
    console.log("here")
    console.log(searchTerm)
    const result = await getJson("google", {
      api_key: process.env['API_KEY'], 
      q: searchTerm,
    });
    console.log(result.organic_results);
    const jsonresult = result.organic_results;
    const urlproduct = jsonresult[0].link;
    console.log(urlproduct)
      
   return urlproduct;
  } catch (error: any) {
    throw new Error(`error in fetching product ${error.message}`);
  }

}