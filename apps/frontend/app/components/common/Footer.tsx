import { Link } from "react-router";
import { Separator } from "../ui/separator";

export function Footer() {
    return (
        <footer className="w-full bg-background border-t">
            <div className="container px-4 py-8 md:py-12 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center text-center md:text-left">
                    {/* Company Info */}
                    <div className="space-y-3 max-w-xs">
                        <h3 className="font-bold text-lg">Tradoora</h3>
                        <p className="text-sm text-muted-foreground">
                            Your trusted marketplace for quality products and services.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="font-semibold">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                            <li><Link to="/products" className="text-sm text-muted-foreground hover:text-primary">Products</Link></li>
                            <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-3">
                        <h4 className="font-semibold">Support</h4>
                        <ul className="space-y-2">
                            <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                            <li><Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary">Shipping Info</Link></li>
                            <li><Link to="/returns" className="text-sm text-muted-foreground hover:text-primary">Returns</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h4 className="font-semibold">Contact Us</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Email: info@tradoora.com</p>
                            <p>Phone: (123) 456-7890</p>
                            <p>Address: Your Address Here</p>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 Tradoora. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}