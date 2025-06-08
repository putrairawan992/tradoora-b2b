import { Minus, Plus, X, ShoppingBag, AlertCircle, Loader2, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { trpc } from "~/lib/trpc";
import type { ListCartType } from "~/types/cart";
import type { CheckoutType } from "~/types/transaction";
import { Skeleton } from "~/components/ui/skeleton";
import { Link, useNavigate, useOutletContext } from "react-router";
import toast from 'react-hot-toast';

declare global {
  interface Window {
    snap: any;
  }
}

type CartItemDetail = ListCartType['items'][number];
type CartSummary = ListCartType['summary'];

type MainLayoutContextType = {
  isAuthenticated: boolean;
  user: { id: string; name: string | null; email: string } | null;
  isLoadingUser: boolean;
};

export default function Cart() {
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useOutletContext<MainLayoutContextType>();

  const {
    data: cartData,
    isLoading: isLoadingList,
    error: listError,
  } = trpc.cart.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: isAuthenticated, 
  });

  const cartItems: CartItemDetail[] = cartData?.items || [];
  const cartSummary: CartSummary | undefined = cartData?.summary;

  const invalidateCartAndTransactionQueries = () => {
    utils.cart.list.invalidate();
    utils.cart.count.invalidate();
    utils.transaction.listByUser.invalidate();
  };

  const updateQtyMutation = trpc.cart.updateQty.useMutation({
    onSuccess: () => {
      toast.success("Cart updated!");
      invalidateCartAndTransactionQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quantity.");
    },
  });

  const removeItemMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success("Item removed from cart!");
      invalidateCartAndTransactionQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item.");
    },
  });

  const clearCartMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      toast.success("Cart cleared!");
      invalidateCartAndTransactionQueries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clear cart.");
    },
  });

  const checkoutMutation = trpc.transaction.checkout.useMutation({
    onSuccess: (data: CheckoutType) => { 
      if (data.snapToken) {
        toast.success("Order created! Redirecting to payment...");
        const midtransPaymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${data.snapToken}`;
        window.location.href = midtransPaymentUrl;
        invalidateCartAndTransactionQueries();
      } else {
        toast.error("Failed to initialize payment. Snap token missing.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Checkout failed. Please try again.");
      console.error("Checkout error", error);
    },
  });


  const formatPrice = (price: string | number | bigint) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const handleUpdateQuantity = (cartItemId: string, currentQty: number, change: number) => {
    const newQuantity = currentQty + change;
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    updateQtyMutation.mutate({ cartItemId, qty: newQuantity });
  };

  const handleRemoveItem = (cartItemId: string) => {
    removeItemMutation.mutate({ cartItemId });
  };

  const handleClearAll = () => {
    if (cartItems.length === 0) return;
    clearCartMutation.mutate();
  };

const handleProceedToCheckout = () => {
  if (!isAuthenticated || !currentUser?.id) {
    toast.error("Please login to proceed to checkout.");
    navigate("/login");
    return;
  }

  if (cartItems.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }
  const firstItem = cartItems[0];
  if (firstItem) {
    checkoutMutation.mutate({
      userId: currentUser.id,
      productId: firstItem.productId,
      qty: firstItem.qty,
      price: Number(firstItem.product.price),
    });
  }
};

  const subtotal = cartSummary?.totalPrice ?? cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.qty;
  }, 0);

  const totalItemsInCart = cartSummary?.totalItems ?? cartItems.length;
  
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  const isMutatingCart = updateQtyMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending;
  const isCheckingOut = checkoutMutation.isPending;

  if (isLoadingList) {
    return (
      <main className="pt-32 md:pt-40 pb-20 max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-bold text-xl">Shopping Cart</h1>
        </div>
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
          <Card className="flex-1">
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="w-8 h-8" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="w-full xl:w-80 h-fit xl:sticky xl:top-32">
            <CardHeader>
              <Skeleton className="h-7 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <hr />
              <Skeleton className="h-6 w-full" />
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  if (listError) {
    if ((listError as any).data?.code === 'UNAUTHORIZED') {
        toast.error("Please login to view your cart.");
        navigate('/login', { replace: true });
        return null; 
    }
    return (
      <main className="pt-32 md:pt-40 pb-20 max-w-6xl mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <CardTitle className="mb-2 text-xl sm:text-2xl">
          Failed to Load Cart
        </CardTitle>
        <CardDescription className="text-center">
          An error occurred while fetching your cart items. Please try again
          later.
        </CardDescription>
        <pre className="mt-4 text-xs bg-red-50 p-2 rounded border border-red-200 text-red-700 max-w-md overflow-auto">
          {listError.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="pt-32 md:pt-40 pb-20 max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-bold text-xl">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
          <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 px-4">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link to="/">
            <Button className="w-full sm:w-auto">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
          <Card className="flex-1">
            <CardHeader className="flex-col sm:flex-row flex justify-between items-start sm:items-center gap-2 sm:gap-0">
              <CardTitle className="text-lg sm:text-xl">
                Items ({totalItemsInCart})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isMutatingCart || clearCartMutation.isPending || isCheckingOut}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 self-end sm:self-auto"
              >
                {clearCartMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {cartItems.map((item: CartItemDetail) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4 sm:gap-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex-shrink-0">
                      <AvatarImage
                        src={item.product.imageUrl ?? undefined}
                        alt={item.product.name ?? "Product"}
                      />
                      <AvatarFallback className="rounded-xl">
                        {item.product.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle
                        className="text-base sm:text-lg leading-tight truncate"
                        title={item.product.name ?? undefined}
                      >
                        {item.product.name ?? "Unknown Product"}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base font-medium">
                        {formatPrice(item.product.price)}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.qty, -1)
                        }
                        disabled={isMutatingCart || updateQtyMutation.isPending && updateQtyMutation.variables?.cartItemId === item.id || isCheckingOut}
                        className="w-8 h-8 flex-shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.qty}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.qty, 1)
                        }
                        disabled={isMutatingCart || updateQtyMutation.isPending && updateQtyMutation.variables?.cartItemId === item.id || isCheckingOut}
                        className="w-8 h-8 flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start space-y-0 sm:space-y-2">
                      <CardTitle className="text-base sm:text-lg">
                        {formatPrice(
                          Number(item.product.price) * item.qty
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isMutatingCart || removeItemMutation.isPending && removeItemMutation.variables?.cartItemId === item.id || isCheckingOut}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                      >
                         {removeItemMutation.isPending && removeItemMutation.variables?.cartItemId === item.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XIcon className="w-3 h-3 mr-1" />}
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-center sm:justify-end pt-4">
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto" disabled={isCheckingOut}>
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="w-full xl:w-80 h-fit xl:sticky xl:top-32">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal ({totalItemsInCart} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-base sm:text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                *Including taxes and fees
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:space-y-3">
              <Button
                className="w-full text-sm sm:text-base bg-amber-600 hover:bg-amber-500"
                size="lg"
                onClick={handleProceedToCheckout}
                disabled={isMutatingCart || isCheckingOut || cartItems.length === 0}
              >
                {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full text-sm sm:text-base" disabled={isMutatingCart || isCheckingOut}>
                Save for Later
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </main>
  );
}