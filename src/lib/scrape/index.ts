"use server";
import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utlis";
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

    const data = {
        url,
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


// export async function scrapePriceBeforeProducts(url: string) {
//   const username = String(process.env.BRIGHT_DATA_USERNAME);
//   const password = String(process.env.BRIGHT_DATA_PASSWORD);
//   const port = 22225;
//   const session_id = (1000000 * Math.random()) | 0;

//   const options = {
//     auth: {
//       username: `${username}-session-${session_id}`,
//       password,
//     },
//     host: "brd.superproxy.io",
//     port,
//     rejectUnauthorized: false,
//   };

//   try {
//     const response = await axios.get(url, options);
//     const $ = cheerio.load(response.data);

//     const currentPriceElement = $('.js-product-price');
//     const previousPriceElement = $('.lowest').next();
//     const discountElement = $('.highest').next();
//     const chartid = $("#price_history_chart");


    
//     const currentPrice = currentPriceElement.text();
//     const previousPrice = previousPriceElement.text();
//     const discount = discountElement.text();
//     const id = chartid.text();
    
//     console.log(currentPrice); // Outputs: "Current Price: $123.45"
//     console.log(previousPrice); // Outputs: "Previous Price: $150.00"
//     console.log(discount);
//     console.log(id);

//      // console.log(data)
//      // return data;
//   } catch (error: any) {
//     throw new Error(`error in fetching product ${error.message}`);
//   }
// }

export async function getGoogleresult(url:string) {
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const usernameserp = String(process.env.BRIGHT_DATA_SERP_USERNAME);
  const passwordserp = String(process.env.BRIGHT_DATA_SERP_PASSWORD);
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
  const optionserp = {
    auth: {
      username: `${usernameserp}-session-${session_id}`,
      password: passwordserp,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();

    const data = {
        url,
        title,
      }

      console.log(data)

      const titleWords = title.split(' ');
      const query = titleWords.slice(0, 5).join(' ');

      // const name = `http://www.google.com/search?q=${encodeURIComponent(query)}%20site:pricehistoryapp.com&brd_json=1`

      // const result = await axios.get(name, optionserp);

      // console.log(result.data);
      const searchTerm = `${encodeURIComponent(query)}%20site:pricehistoryapp.com`
      const result = await getJson("google", {
        api_key: process.env['API_KEY'], 
        q: searchTerm,
      });
      console.log(result.organic_results);
      const jsonresult = result.organic_results;
      const urlproduct = jsonresult[0].link;
      console.log(urlproduct)
      
      // return data;
  } catch (error: any) {
    throw new Error(`error in fetching product ${error.message}`);
  }

}