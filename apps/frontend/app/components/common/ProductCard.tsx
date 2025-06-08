import type { ProductType } from '~/types/product'; 
import { CardDescription, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { trpc } from '~/lib/trpc';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router'; 

interface ProductCardProps {
  product: ProductType;
  onNavigate: (slug: string) => void;
}

export function ProductCard({ product, onNavigate }: ProductCardProps) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: (data) => {
      toast.success(`${product.name} added to cart!`);
      utils.cart.list.invalidate();
      utils.cart.count.invalidate(); 
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        toast.error('Please login to add items to your cart.');
        // navigate('/login'); 
      } else {
        toast.error(error.message || `Failed to add ${product.name} to cart.`);
      }
      console.error("Add to cart error", error);
    },
  });

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    if (addToCartMutation.isPending) {
      return;
    }
    addToCartMutation.mutate({
      productId: product.id,
      qty: 1, 
    });
  };

  const isLoadingAddToCart = addToCartMutation.isPending;

  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="relative group cursor-pointer" onClick={() => onNavigate(product.slug)}>
          <img
            className="object-cover w-full h-48"
            src={product.imageUrl ?? 'https://via.placeholder.com/300'}
            alt={product.name ?? 'Product image'}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full border-0 bg-white hover:bg-gray-100 shadow-md"
              title="Add to cart"
              onClick={handleAddToCart}
              disabled={isLoadingAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              {isLoadingAddToCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <CardDescription
            onClick={() => onNavigate(product.slug)}
            className="text-sm cursor-pointer hover:underline truncate h-10 flex items-center"
            title={product.name ?? undefined}
          >
            {product.name}
          </CardDescription>
          <CardTitle className="text-base md:text-lg">
            Rp {Number(product.price).toLocaleString('id-ID')}
          </CardTitle>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Star className="text-green-400 fill-green-400 w-4 h-4" />
          <span className="text-xs md:text-sm font-medium">4.9</span>-
          <span className="text-xs md:text-sm">
            {product.stockQuantity} stok tersedia
          </span>
        </div>
      </div>
    </div>
  );
}