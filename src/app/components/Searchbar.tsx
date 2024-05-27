"use client"
import { useRouter } from 'next/navigation';
import { scrapeAndStoreProducts } from '@/lib/actions';
// import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'
import { toast } from 'sonner';

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

        const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));
        toast.promise(promise, {
        loading: 'Loading... redirecting',
        position: 'top-center',
        success: () => {
        return `redirecting on yours Product page`;
       },
    error: 'Error',
});
        const product = await scrapeAndStoreProducts(searchPrompt);
      if (product && product.redirectUrl) {
        console.log(product.redirectUrl);
        router.push(`/products/${product.redirectUrl}`);
    } else {
        alert('Product or redirectUrl not available');
    }
    // alert("valid")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
      className="flex px-4 flex-wrap gap-4 mt-12" 
      onSubmit={handleSubmit}
    >
      <input 
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product name or link"
        className="flex-1 min-w-[200px] w-full p-3 pl-5 border border-gray-300 rounded-3xl shadow-xs text-base text-gray-500 focus:outline-none"
      />

      <button 
        type="submit" 
        className="bg-[#5a259f]  rounded-3xl shadow-xs px-6 py-3 text-white text-base font-semibold hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default Searchbar