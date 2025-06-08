import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router";
import { Heart, Minus, Plus, Share2, ShoppingCart, Star, Loader2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { trpc } from "~/lib/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import { ProductCard } from "~/components/common/ProductCard";
import type { ProductType } from "~/types/product";
import type { GetReviewByProduct, CreateReview } from "~/types/review";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type ReviewItemType = GetReviewByProduct[number];

type AuthLayoutContextType = {
  isAuthenticated: boolean;
  user: { id: string; name: string | null; email: string } | null;
  isLoadingUser: boolean;
};


export default function DetailProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  
  const outletContext = useOutletContext<AuthLayoutContextType | undefined>();
  const currentUser = outletContext?.user;
  const isAuthenticated = outletContext?.isAuthenticated ?? false;


  const [showReviewForm, setShowReviewForm] = useState(false);
  const [counterQty, setCounterQty] = useState(1);
  
  const [currentRating, setCurrentRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");


  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = trpc.product.getBySlug.useQuery({ slug: slug! }, { enabled: !!slug });

  const {
    data: reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
  } = trpc.review.getByProductId.useQuery(
    { productId: product?.id! },
    { enabled: !!product?.id }
  );

  const {
    data: relatedProductsData,
    isLoading: relatedIsLoading,
  } = trpc.product.list.useQuery(
    { categoryId: product?.category?.id },
    {
      enabled: !!product && !!product.category?.id,
    }
  );

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: (data) => {
      toast.success(`${product?.name || 'Product'} added to cart!`);
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        toast.error('Please login to add items to your cart.');
        navigate('/login');
      } else {
        toast.error(error.message || `Failed to add product to cart.`);
      }
      console.error("Add to cart error", error);
    },
  });

  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setCurrentRating(0);
      setReviewComment("");
      if (product?.id) {
        utils.review.getByProductId.invalidate({ productId: product.id });
      }
    },
    onError: (error) => {
       if (error.data?.code === 'UNAUTHORIZED') {
        toast.error('Please login to submit a review.');
        navigate('/login');
      } else {
        toast.error(error.message || "Failed to submit review.");
      }
      console.error("Create review error:", error);
    }
  });


  let relatedProductsToDisplay: ProductType[] = [];
  if (product && relatedProductsData) {
    relatedProductsToDisplay = relatedProductsData
      .filter(p => p.id !== product.id)
      .slice(0, 4);
  }

  const handleProductNavigation = (productSlug: string) => {
    navigate(`/product/${productSlug}`);
    window.scrollTo(0, 0);
  };

  const handleIncrement = () => {
    setCounterQty((prev) => prev < (product?.stockQuantity || Infinity) ? prev + 1 : prev);
  };

  const handleDecrement = () => {
    setCounterQty((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!product) {
      toast.error("Product details not available.");
      return;
    }
     if (!isAuthenticated) {
      toast.error('Please login to add items to your cart.');
      navigate('/login');
      return;
    }
    if (addToCartMutation.isPending) return;

    addToCartMutation.mutate({
      productId: product.id,
      qty: counterQty,
    });
  };

  const handleSetRating = (rating: number) => {
    setCurrentRating(rating);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) {
        toast.error("Product information is missing.");
        return;
    }
    if (!currentUser?.id) {
        toast.error("You must be logged in to submit a review.");
        navigate("/login");
        return;
    }
    if (currentRating === 0) {
        toast.error("Please select a rating.");
        return;
    }

    createReviewMutation.mutate({
        productId: product.id,
        userId: currentUser.id,
        rating: currentRating,
        comment: reviewComment.trim() === "" ? undefined : reviewComment.trim(),
    });
  };


  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (index: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${interactive ? "hover:text-yellow-500 hover:fill-yellow-500 cursor-pointer" : ""} ${i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          onClick={interactive && onStarClick ? () => onStarClick(i) : undefined}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };


  if (isLoadingProduct) {
    return (
      <main className="max-w-7xl w-full mx-auto py-20 px-4 md:px-3 lg:px-0 lg:pt-40 pt-28 pb-20">
        <div className="flex gap-10 lg:flex-row flex-col">
          <Skeleton className="w-full lg:w-[350px] h-[350px]" />
          <div className="flex flex-col gap-3 flex-grow">
            <Skeleton className="w-3/4 h-9" />
            <Skeleton className="w-1/2 h-9" />
            <Skeleton className="w-full h-8" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="w-1/3 h-8" />
              <Skeleton className="w-1/2 h-12" />
              <div className="flex flex-row gap-3">
                <Skeleton className="w-[109px] h-12" />
                <Skeleton className="w-[109px] h-12" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (productError || !product) {
    if (productError?.data?.code === "NOT_FOUND" || !product && !isLoadingProduct) {
      return (
        <main className="max-w-7xl w-full mx-auto py-20 px-4 md:px-3 lg:px-0 lg:pt-40 pt-28">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              Product not found
            </h2>
            <p className="text-gray-500 mt-2">
              The product you’re looking for doesn’t exist or has been removed.
            </p>
          </div>
        </main>
      );
    }
    return (
      <main className="max-w-7xl w-full mx-auto py-20 px-4 md:px-3 lg:px-0 lg:pt-40 pt-28">
        <div className="text-center text-red-500">Error: {productError?.message || "Failed to load product."}</div>
      </main>
    );
  }
  
  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((acc: any, r: { rating: any; }) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <main className="max-w-6xl w-full mx-auto lg:pt-40 pt-28 pb-20 lg:px-0 md:px-3 px-4">
      <div className="flex gap-10 lg:flex-row flex-col">
        <Card className="w-full max-w-[350px] h-[350px] overflow-hidden cursor-zoom-in shrink-0">
          <CardContent className="p-0 h-full">
            <img
              src={product.imageUrl ?? "https://via.placeholder.com/400"}
              alt={product.name ?? "Product"}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-125"
            />
          </CardContent>
        </Card>
        <div className="space-y-2 flex-grow">
          <h2 className="text-lg font-bold">{product.name}</h2>
          <h1 className="text-2xl font-bold">
            Rp {Number(product.price).toLocaleString("id-ID")}
          </h1>
          <CardDescription className="max-w-2xl">
            {product.description}
          </CardDescription>
          <Separator className="my-4" />
          <CardTitle className="text-sm">Quantity</CardTitle>
          <div className="flex mt-1 items-center border rounded-md overflow-hidden lg:w-fit md:w-fit p-1 w-full sm:w-auto justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="hover:cursor-pointer w-10 h-10"
              onClick={handleDecrement}
              disabled={counterQty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              className="w-16 h-10 text-center font-bold shadow-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={counterQty}
              readOnly
              aria-label="Current quantity"
            />
            <Button
              variant="ghost"
              size="icon"
              className="hover:cursor-pointer w-10 h-10"
              onClick={handleIncrement}
              disabled={counterQty >= (product.stockQuantity || Infinity)}
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:flex-row md:flex-row flex-col">
            <Button 
              className="bg-amber-600 hover:bg-amber-500 lg:w-auto md:w-auto w-full h-11 text-base"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stockQuantity === 0}
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              {product.stockQuantity === 0 ? "Out of Stock" : "Add To Cart"}
            </Button>
            <Button variant="outline" className="lg:w-auto md:w-auto w-full h-11 text-base">
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </Button>
            <Button variant="outline" className="lg:w-auto md:w-auto w-full h-11 text-base">
              <Share2 className="mr-2 h-4 w-4 lg:mr-0 md:mr-0" />
              <span className="lg:hidden md:hidden block">Share</span>
            </Button>
          </div>
          {product.stockQuantity !== null && product.stockQuantity < 5 && product.stockQuantity > 0 && (
             <p className="text-sm text-red-600">Only {product.stockQuantity} items left!</p>
          )}
        </div>
      </div>
      <div className="mt-7">
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="spesification">Specification</TabsTrigger>
            <TabsTrigger value="review">Review ({reviews?.length || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <p className="text-sm md:text-base leading-7 text-gray-700 max-w-prose mt-4 w-full">
              {product.description}
            </p>
          </TabsContent>
          <TabsContent value="spesification">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Specification</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Stock</TableCell>
                  <TableCell>{product.stockQuantity} units</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Minimum Order</TableCell>
                  <TableCell>{product.minimumOrderQuantity} unit(s)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Category</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="review">
            <div className="flex gap-6 lg:flex-row flex-col mt-4">
              <div className="lg:w-1/3 w-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Rating</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                        {renderStars(averageRating)}
                        <span className="ml-2 text-sm text-muted-foreground">
                            ({reviews?.length || 0} reviews)
                        </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        if (!isAuthenticated) {
                            toast.error("Please login to write a review.");
                            navigate("/login");
                            return;
                        }
                        setShowReviewForm(true);
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-500"
                      disabled={!isAuthenticated}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> Write a Review
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:w-2/3 w-full space-y-4">
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit}>
                    <Card>
                      <CardHeader>
                          <CardTitle>Write Your Review</CardTitle>
                          <CardDescription>Share your thoughts about {product.name}.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col">
                          <div className="mb-2">
                            <span className="text-sm font-medium">Your Rating:</span>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((starRating) => (
                                <Star
                                  key={starRating}
                                  className={`w-6 h-6 cursor-pointer ${starRating <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
                                  onClick={() => handleSetRating(starRating)}
                                />
                              ))}
                            </div>
                          </div>
                          <Textarea
                            placeholder="Tell us more about your experience..."
                            className="min-h-[100px] mt-1"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            required
                          />
                          <div className="flex gap-2 mt-3">
                            <Button type="submit" className="bg-amber-600 hover:bg-amber-500" disabled={createReviewMutation.isPending || currentRating === 0}>
                              {createReviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Submit Review
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowReviewForm(false);
                                setCurrentRating(0);
                                setReviewComment("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                )}

                {isLoadingReviews ? (
                    [...Array(2)].map((_,i) => (
                        <Card key={i}>
                            <CardContent className="py-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Skeleton className="h-10 w-10 rounded-full"/>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24"/>
                                        <Skeleton className="h-3 w-16"/>
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-1/4 mb-2"/>
                                <Skeleton className="h-12 w-full"/>
                            </CardContent>
                        </Card>
                    ))
                ) : reviewsError ? (
                    <p className="text-red-500">Could not load reviews: {reviewsError.message}</p>
                ) : reviews && reviews.length > 0 ? (
                  reviews.map((review: ReviewItemType) => (
                    <Card key={review.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{review.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-sm">{review.user?.name || "Anonymous"}</h4>
                                    <div className="text-xs text-muted-foreground">
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>
                            {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                           <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  !showReviewForm && <p className="text-center text-gray-500 py-6">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {product && product.category?.id && (
        <>
          <Separator className="my-10" />
          <div>
            <h1 className="text-2xl font-bold mb-1">Related Products</h1>
            <CardDescription className="mb-5">
              You might also like these products
            </CardDescription>
            {relatedIsLoading && !relatedProductsToDisplay.length && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-[280px] rounded-lg" />
                ))}
              </div>
            )}
            {!relatedIsLoading && relatedProductsToDisplay.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedProductsToDisplay.map((relatedProd) => (
                  <ProductCard
                    key={relatedProd.id}
                    product={relatedProd}
                    onNavigate={handleProductNavigation}
                  />
                ))}
              </div>
            )}
            {!relatedIsLoading && relatedProductsToDisplay.length === 0 && relatedProductsData && relatedProductsData.length > 0 && (
              <p className="text-sm text-muted-foreground">No other related products found in this category.</p>
            )}
             {!relatedIsLoading && (!relatedProductsData || relatedProductsData.length === 0) && (
              <p className="text-sm text-muted-foreground">No related products found in this category.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}