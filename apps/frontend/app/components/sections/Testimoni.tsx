import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { trpc } from "~/lib/trpc"; 
import type { ListReview } from "~/types/review"; 
import { Skeleton } from "../ui/skeleton"; 
import { MessageSquareText } from "lucide-react";


type ReviewItem = ListReview[number];

export function Testimoni() {
    const { 
        data: reviews, 
        isLoading, 
        error 
    } = trpc.review.listAll.useQuery(
        undefined,
        {
            staleTime: 5 * 60 * 1000,
        }
    );

    const safeReviews: ReviewItem[] = reviews || [];

    if (error) {
        return (
            <section className="py-12 px-4 max-w-6xl mx-auto w-full text-center">
                <h2 className="text-3xl font-black text-center mb-8">What Our Customers Say</h2>
                <p className="text-red-500">Failed to load testimonials. Please try again later.</p>
                <pre className="mt-2 text-xs text-muted-foreground">{error.message}</pre>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 max-w-6xl mx-auto w-full">
            <h2 className="text-3xl font-black text-center mb-8">What Our Customers Say</h2>
            {isLoading ? (
                <Carousel opts={{ align: "start" }}>
                    <CarouselContent>
                        {[...Array(3)].map((_, index) => (
                            <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/2">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[150px]" />
                                                <Skeleton className="h-3 w-[100px]" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-full mb-1" />
                                        <Skeleton className="h-4 w-full mb-1" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            ) : safeReviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                     <MessageSquareText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg">No testimonials yet.</p>
                    <p className="text-sm">Be the first to share your experience!</p>
                </div>
            ) : (
                <Carousel 
                    opts={{ align: "start", loop: safeReviews.length > 2 }} 
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {safeReviews.map((review: ReviewItem) => (
                            <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full flex flex-col">
                                        <CardContent className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-4 mb-4">
                                                <Avatar className="h-11 w-11">
                                                    <AvatarFallback className="bg-amber-100 text-amber-700">
                                                        {review.user?.name ? review.user.name.substring(0, 2).toUpperCase() : "???"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-base">{review.user?.name || "Anonymous User"}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        Verified Customer {review.product ? `- for ${review.product.name}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 flex-grow">
                                                {review.comment || "No comment provided."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {safeReviews.length > 1 && (
                        <>
                            <CarouselPrevious className="hidden sm:flex" />
                            <CarouselNext className="hidden sm:flex" />
                        </>
                    )}
                </Carousel>
            )}
        </section>
    );
}