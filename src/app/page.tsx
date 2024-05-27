import Image from "next/image";
import Searchbar from "./components/Searchbar";
import HeroCarousel from "./components/HeroCarousel";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "./components/ProductCard";

const  Home = async () => {
  const allProducts = await getAllProducts();
  return (
   <>
   <section className=" md:pl-12 " style={{
    backgroundImage: `url(${'/assets/images/Backgroundimage.png'})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
  }}>
        <div className="flex max-xl:flex-col pb-12 gap-16" >
          <div className="flex flex-col pb-6 sm:pb-2 justify-center"> 
            <p className="hidden sm:flex gap-2 text-sm pb-12 text-gray-700 font-medium text-primary">
              Smart Shopping Starts Here:
              <Image 
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>
            

            <h1 className="mt-24 sm:mt-4 text-6xl leading-[72px] font-semibold tracking-[-1.5px] sm:tracking-[-1.2px] text-gray-900">
              Unleash the Power of
              <span className="text-primary"> WatchTheDrop</span>
            </h1>

            <p className="mt-6 px-4">
              Powerful, self-serve product and growth analytics to help you convert, engage, and retain more.
            </p>

            <Searchbar />
          </div>

          <HeroCarousel />
        </div>
      </section>

      <section className="flex flex-col gap-10 px-6 md:px-20 py-24">
        <h2 className="text-secondary text-[32px] font-semibold">Trending</h2>

        <div className="flex flex-wrap items-center justify-evenly gap-x-8 gap-y-16">
          {allProducts?.reverse().map((product) => (
            <ProductCard key={product._id} product={product} />
            // <h1>{product.title}</h1>
          ))}
        </div>
      </section>
   </>
  );
}

export default Home;