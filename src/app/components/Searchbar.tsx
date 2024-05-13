"use client"
import { useRouter } from 'next/navigation';
import { scrapeAndStoreProducts } from '@/lib/actions';
// import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if(
      hostname.includes('amazon.com') || 
      hostname.includes ('amazon.') || 
      hostname.endsWith('amazon') ||
      hostname.includes('flipkart.com') || 
      hostname.includes ('flipkart.') || 
      hostname.endsWith('flipkart')
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();


    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if(!isValidLink) router.push(`/shopping/${searchPrompt}`);

    try {
      setIsLoading(true);

      // Scrape the product page
      if(isValidLink){

        const product = await scrapeAndStoreProducts(searchPrompt);
      
      if (product && product.redirectUrl) {
        console.log(product.redirectUrl);
        router.push(`/products/${product.redirectUrl}`);
    } else {
        alert('Product or redirectUrl not available');
    }
    alert("valid")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
      className="flex flex-wrap gap-4 mt-12" 
      onSubmit={handleSubmit}
    >
      <input 
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="flex-1 min-w-[200px] w-full p-3 border border-gray-300 rounded-lg shadow-xs text-base text-gray-500 focus:outline-none"
      />

      <button 
        type="submit" 
        className="bg-gray-900 border border-gray-900 rounded-lg shadow-xs px-5 py-3 text-white text-base font-semibold hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default Searchbar