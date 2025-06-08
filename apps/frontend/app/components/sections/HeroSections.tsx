import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export function HeroSections() {
  return (
    <main className="w-full min-h-[70vh] relative">
      <div className="bg-black w-full h-full overflow-hidden relative">
        <img 
          className="w-full h-full object-cover opacity-50" 
          src="https://images.pexels.com/photos/3769747/pexels-photo-3769747.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Baner" 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Shop Smarter, <strong className="text-lime-600">Live Better</strong>
          </h1>
          <p className="max-w-2xl mb-6 text-white text-sm md:text-base px-4">
            Discover thousands of products with fast shipping and unbeatable prices. Your one-stop destination for all your shopping needs.
          </p>
          <div className="flex gap-2 md:gap-4">
            <Button size="lg" variant="default" className="bg-lime-600 hover:bg-lime-700 cursor-pointer">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer">
              Special Offers
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute -translate-y-24 w-full px-4">
        <Card className="max-w-5xl w-full mx-auto">
          <CardHeader className="flex-col md:flex-row flex justify-between gap-2">
            <div>
              <CardTitle>Shop by Category</CardTitle>
              <CardDescription>
                Browse our wide selection of products by category
              </CardDescription>
            </div>
            <Button variant={"link"}>View All Categories</Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, index) => (
              <Card key={index} className="p-2 flex items-center gap-3 flex-row">
                <Avatar className="rounded-lg">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>Iphone</AvatarFallback>
                </Avatar>
                <CardDescription>Electronic</CardDescription>
              </Card>
            ))}
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </main>
  );
}
