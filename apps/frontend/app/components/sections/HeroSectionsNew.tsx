import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

const images = [
  "https://dgwhekppvgprrvdbbesb.supabase.co/storage/v1/object/public/assets//1.png",
  "https://dgwhekppvgprrvdbbesb.supabase.co/storage/v1/object/public/assets//2.png",
];

export function HeroSectionsNew() {
  return (
    <main className="pt-28">
      <Carousel className="w-full max-w-6xl mx-auto">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="overflow-hidden rounded-xl border-0 shadow-none">
                  <CardContent className="h-[400px] w-full p-0">
                    <img
                      src={src}
                      alt={`Hero ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="h-24 rounded hover:bg-accent cursor-pointer" />
        <CarouselNext className="h-24 rounded hover:bg-accent cursor-pointer" />
      </Carousel>
    </main>
  );
}