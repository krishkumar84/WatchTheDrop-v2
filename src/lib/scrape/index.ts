"use server";
import axios from "axios";
import * as cheerio from "cheerio";
import { extractContent, extractCurrency, extractDescription, extractPrice } from "../utlis";
import { getJson } from "serpapi";

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
export async function googleShoppingResult(title: string) {
  try {
    const json = await getJson({
        engine: "google_shopping",
        q: `${title}`, 
        location: "India",
        hl: "en",
        gl: "us",
        api_key: process.env.API_KEY,
    });

    // console.log(json["shopping_results"])
    console.log("shopping_results")
     return json["shopping_results"];
} catch (error) {
    console.error("Error occurred while scraping:", error);
}
}


export async function getGoogleresult(title:string) {
  
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