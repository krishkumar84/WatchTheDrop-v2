"use client";
import { Product } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductCard from "./ProductCard";

interface Props {
  product: Product;
}

const ProductCardWithLoader = ({ product }: Props) => {
  const router = useRouter();

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const promise = () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ name: "Product" }), 1000)
      );

    toast.promise(promise, {
      loading: "🔍 Loading product details...",
      position: "top-center",
      success: () => "✅ Opening product page",
      error: "❌ Failed to load product",
    });

    setTimeout(() => {
      router.push(`/products/${product._id}`);
    }, 200);
  };

  return <ProductCard product={product} onClick={handleProductClick} />;
};

export default ProductCardWithLoader;
