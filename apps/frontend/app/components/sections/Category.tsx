import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Laptop, Shirt, Home, Volleyball, ToyBrick, Book } from "lucide-react";

const data = [
  { name: "Electronics", icon: Laptop, color: "text-blue-500" },
  { name: "Fashion", icon: Shirt, color: "text-pink-500" },
  { name: "Home & Living", icon: Home, color: "text-green-500" },
  { name: "Sports", icon: Volleyball, color: "text-orange-500" },
  { name: "Toys", icon: ToyBrick, color: "text-yellow-500" },
  { name: "Books", icon: Book, color: "text-purple-500" },
];

export function Category() {
  return (
    <main className="max-w-6xl w-full mx-auto py-6 lg:px-4 px-0">
      <Card>
        <CardHeader>
          <CardTitle>Category Popular</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-3">
          {data.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="flex flex-row items-center shadow-none p-2 w-full"
              >
                <CardContent className="flex-row flex justify-end gap-2 items-center p-1">
                  <Icon size={20} className={item.color} />
                  <CardDescription className="font-medium">
                    {item.name}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </main>
  );
}
