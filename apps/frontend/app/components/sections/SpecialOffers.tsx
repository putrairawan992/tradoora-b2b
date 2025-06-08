import { ShoppingCart, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import { useNavigate } from "react-router";
import { useState } from "react";
import { trpc } from "~/lib/trpc";
import type { ProductType } from "~/types/product";
import { ProductCard } from "../common/ProductCard";

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 50000000;

export function SpecialOffers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    DEFAULT_MIN_PRICE,
    DEFAULT_MAX_PRICE,
  ]);
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
    navigate("/product");
  };
  return (
    <section className="max-w-6xl mx-auto w-full mt-20 px-4 sm:px-6">
      <Card className="bg-amber-500 h-auto p-0 rounded-2xl border-0">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="space-y-5 max-w-2xl p-6 md:px-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Special Offers
              </h1>
              <p className="font-medium text-white">
                Discover amazing deals on selected products. Limitied time
                offer, so act fast!
              </p>
              <div>
                <Button size={"lg"} variant="outline" className="font-bold">
                  Shop Now
                </Button>
              </div>
            </div>
            <div className="w-full md:w-80 h-48 md:h-64 bg-black md:rounded-tr-2xl md:rounded-br-2xl rounded-b-2xl overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://images.pexels.com/photos/6214155/pexels-photo-6214155.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt=""
              />
            </div>
          </div>
        </CardContent>
      </Card>
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
        <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={handleDirectDetail}
            />
          ))}
        </div>
      )}
      <div className="mt-10 flex items-center justify-center">
        <Button onClick={handleViewAll} className="bg-amber-600 hover:bg-amber-700" size={"lg"}>
          View All Special Offers
        </Button>
      </div>
    </section>
  );
}
