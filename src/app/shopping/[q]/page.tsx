'use client'
import { googleShoppingResult } from "@/lib/scrape";
import Link from "next/link";
import { useEffect,useState } from "react";
import { usePathname } from 'next/navigation'

  const ShoppingResult = () => {
  const title = usePathname();
    console.log(title);
    const [shopResult, setShopResult] =useState([])
    useEffect(() => {
        async function fetchData() {
            try {
                const products = await googleShoppingResult(title!);
                setShopResult(products);
            } catch (error) {
                console.error("Error occurred while fetching data:", error);
            }
        }
    
        fetchData(); 
    
    }, []);
    
    
return(
    <div className="flex flex-wrap items-center justify-evenly px-8 gap-x-8 gap-y-16">
    {shopResult.map((product:any, index:any) => (
        <div key={index} className="sm:w-[292px] sm:max-w-[292px] w-full flex-1 flex flex-col gap-4 rounded-md" >
     <Link href={"#"} className="sm:w-[292px] sm:max-w-[292px] w-full flex-1 flex flex-col gap-4 rounded-md">
           <div className="flex-1 relative flex flex-col gap-5 p-4 rounded-md">
             <img 
               src={product.thumbnail}
               alt={product.title}
               width={200}
               height={200}
               className="max-h-[250px] object-contain w-full h-full bg-transparent"
             />
           </div>
     
           <div className="flex flex-col gap-3">
             <h3 className="text-secondary text-xl leading-6 font-semibold truncate">{product.title}</h3>
     
             <div className="flex justify-between">
               <p className="text-black opacity-50 text-lg capitalize">
                 {product.rating}
               </p>
     
               <p className="text-black text-lg font-semibold">
                 <span>{product?.price}</span>
                 <span>{product?.extracted_old_price}</span>
               </p>
             </div>
           </div>
         </Link>
         </div>
        ))}
        </div>
);
}

export default ShoppingResult;