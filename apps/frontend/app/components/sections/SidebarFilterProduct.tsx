import { X } from "lucide-react";
import { Button } from "../ui/button";
import { CardDescription, CardTitle } from "../ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { trpc } from "~/lib/trpc";
import type { CategoryType } from "~/types/category";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect } from "react";

const MIN_PRICE = 0;
const MAX_PRICE = 50000000; 
const PRICE_STEP = 100000;

interface SidebarFilterProductProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string, isSelected: boolean) => void;
  currentPriceRange: [number, number];
  onPriceChange: (newRange: [number, number]) => void;
  onClearAllFilters: () => void;
}

export function SidebarFilterProduct({
  selectedCategoryId,
  onCategoryChange,
  currentPriceRange,
  onPriceChange,
  onClearAllFilters,
}: SidebarFilterProductProps) {
  
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = trpc.category.list.useQuery();

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(currentPriceRange);

  useEffect(() => {
    setLocalPriceRange(currentPriceRange);
  }, [currentPriceRange]);

  const handleSliderCommit = (value: number[]) => {
    onPriceChange(value as [number, number]);
  };

  const handleSliderValueChange = (value: number[]) => {
    setLocalPriceRange(value as [number, number]);
  };
  
  
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <aside className="w-full lg:w-80 h-fit border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Button size="sm" variant="ghost" onClick={onClearAllFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["categories-filter", "price-range-filter"]}
        className="w-full"
      >
        <AccordionItem value="categories-filter">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            {isLoadingCategories ? (
              <div className="ml-3 space-y-2 pt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : categoriesError ? (
              <p className="text-sm text-red-500 ml-3 pt-1">
                Failed to load categories.
              </p>
            ) : categories && categories.length > 0 ? (
              <ul className="ml-3 space-y-2 pt-1">
                {categories.map((category: CategoryType) => (
                  <li
                    key={category.id}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategoryId === category.id}
                      onCheckedChange={(checked) => {
                        onCategoryChange(category.id, !!checked);
                      }}
                    />
                    <label
                      htmlFor={`cat-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground ml-3 pt-1">
                No categories available.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price-range-filter">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="mt-4 px-1">
              <Slider
                value={localPriceRange}
                onValueChange={handleSliderValueChange} 
                onValueCommit={handleSliderCommit}
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                minStepsBetweenThumbs={1}
              />
              <div className="flex mt-3 items-center justify-between text-xs">
                <CardDescription>{formatPrice(localPriceRange[0])}</CardDescription>
                <CardDescription>{formatPrice(localPriceRange[1])}</CardDescription>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}