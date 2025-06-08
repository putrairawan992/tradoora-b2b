import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Brands() {
  const brandLogos = [
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png", 
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png",
    "https://github.com/shadcn.png"
  ];

  return (
    <section className="py-20 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-lime-100 text-lime-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
            Trusted by Leading Companies.
          </div>
          <h1 className="text-xl lg:text-3xl font-black text-gray-900 mb-4">
            Trusted by <span className="text-lime-600">Leading Brands</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Join 500+ companies that have trusted our B2B platform to connect and transact with their business partners.
          </p>
        </div>

        {/* Brands Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center mb-12">
          {brandLogos.map((logo, index) => (
            <div key={index} className="group relative">
              <div className="w-24 rounded-full h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white  overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center border border-gray-100">
                <img 
                  src={logo} 
                  alt={`Brand ${index + 1}`}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-lime-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}