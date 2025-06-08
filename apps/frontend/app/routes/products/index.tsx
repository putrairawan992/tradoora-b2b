import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { CardDescription } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useNavigate, useSearchParams, Link } from "react-router";
import { trpc } from "~/lib/trpc";
import { ProductCard } from "~/components/common/ProductCard";
import type { ProductType } from "~/types/product";
import { SidebarFilterProduct } from "~/components/sections/SidebarFilterProduct";

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 50000000;

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(searchParams.get("category") || undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    DEFAULT_MIN_PRICE,
    DEFAULT_MAX_PRICE,
  ]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || undefined;
    const searchFromUrl = searchParams.get("search") || "";

    if (categoryFromUrl !== selectedCategoryId) {
      setSelectedCategoryId(categoryFromUrl);
    }
    if (searchFromUrl !== searchTerm) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);


  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    if (selectedCategoryId) {
      params.set("category", selectedCategoryId);
    } else {
      params.delete("category");
    }
    
    if (priceRange[0] !== DEFAULT_MIN_PRICE) params.set("minPrice", priceRange[0].toString());
    else params.delete("minPrice");
    if (priceRange[1] !== DEFAULT_MAX_PRICE) params.set("maxPrice", priceRange[1].toString());
    else params.delete("maxPrice");
    
    if (params.toString() !== searchParams.toString()) {
        setSearchParams(params, { replace: true });
    }
  }, [searchTerm, selectedCategoryId, priceRange, setSearchParams, searchParams]);


  const { data, isLoading, error } = trpc.product.list.useQuery({
    searchTerm: searchTerm || undefined,
    categoryId: selectedCategoryId,
    minPrice: priceRange[0] === DEFAULT_MIN_PRICE && priceRange[1] === DEFAULT_MAX_PRICE ? undefined : priceRange[0],
    maxPrice: priceRange[1] === DEFAULT_MAX_PRICE && priceRange[0] === DEFAULT_MIN_PRICE ? undefined : priceRange[1],
  });

  const handleCategoryChange = (categoryId: string, isSelected: boolean) => {
    const newCategoryId = isSelected ? categoryId : undefined;
    if (newCategoryId !== selectedCategoryId) {
        setSearchTerm("");
    }
    setSelectedCategoryId(newCategoryId);
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategoryId(undefined);
    setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
  };

  const products: ProductType[] = data ?? [];
  const handleDirectDetail = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value && selectedCategoryId) {
        setSelectedCategoryId(undefined);
    }
  };

  return (
    <section className="min-h-screen max-w-7xl mx-auto w-full px-4 py-8 lg:pt-36 pt-28">
      <div className="mb-6">
        <h1 className="text-2xl font-black">
          {searchTerm ? `Search Results for "${searchTerm}"` : selectedCategoryId ? `Products` : "All Products"}
        </h1>
        <CardDescription>Browse our wide selection of products</CardDescription>
      </div>
      <div className="flex flex-col lg:flex-row gap-5">
        <SidebarFilterProduct
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategoryChange}
          currentPriceRange={priceRange}
          onPriceChange={handlePriceChange}
          onClearAllFilters={handleClearAllFilters}
        />
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Input
                type="search"
                className="pr-8"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price_asc">Price: Low To High</SelectItem>
                  <SelectItem value="price_desc">Price: High To Low</SelectItem>
                  <SelectItem value="newest">New Arrivals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 py-10">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">Error: {error.message}</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={handleDirectDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}