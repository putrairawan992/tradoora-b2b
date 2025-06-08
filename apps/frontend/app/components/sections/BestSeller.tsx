import { ArrowRight } from "lucide-react";
import { CardDescription, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ProductCard } from "../common/ProductCard";
import { useState } from "react";
import { trpc } from "~/lib/trpc";
import type { ProductType } from "~/types/product";
import { useNavigate } from "react-router";

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 50000000;

export function BestSeller() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

  const { data, isLoading, error } = trpc.product.list.useQuery({
    searchTerm,
    categoryId: selectedCategoryId,
    minPrice:
      priceRange[0] === DEFAULT_MIN_PRICE && priceRange[1] === DEFAULT_MAX_PRICE
        ? undefined
        : priceRange[0],
    maxPrice:
      priceRange[1] === DEFAULT_MAX_PRICE && priceRange[0] === DEFAULT_MIN_PRICE
        ? undefined
        : priceRange[1],
  });

  const products: ProductType[] = data ?? [];

  const handleDirectDetail = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleViewAll = () => {
    navigate("/product")
  }

  return (
    <section className="w-full h-auto max-w-6xl mx-auto lg:px-4 px-0 pt-5">
      <div className="my-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold">Best Sellers</h1>
          <span className="text-gray-500 text-sm md:text-base">
            Our most popular products based on sales
          </span>
        </div>
        <Button variant={"link"} onClick={handleViewAll}>
          View All <ArrowRight className="ml-2" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">
            No products found
          </h2>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filters to find products.
          </p>
        </div>
      ) : (
        <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {products.slice(0, 5).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={handleDirectDetail}
          />
        ))}
        </div>
      )}
    </section>
  );
}
