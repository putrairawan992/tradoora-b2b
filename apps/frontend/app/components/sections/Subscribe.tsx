import { CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button"; // Assuming you have a Button component

export function Subscribe() {
    return (
        <section className="py-12 w-full bg-amber-500">
            <div className="max-w-6xl w-full mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                        #Subscribe to our newsletter.
                    </h1>
                    <CardDescription className="text-gray-300">
                        Get the latest updates, deals and exclusive offers.
                    </CardDescription>
                </div>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <Input 
                        type="email" 
                        className="bg-white h-11 min-w-[300px]" 
                        placeholder="Your email address"
                    />
                    <Button 
                        className="bg-primary text-white hover:bg-primary/90 h-11 px-6"
                    >
                        Subscribe
                    </Button>
                </div>
            </div>
        </section>
    );
}
