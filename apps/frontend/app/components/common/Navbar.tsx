import { Link, useNavigate } from "react-router";
import { AlignJustify, Search, ShoppingCart, User as UserIconLucide, X as XIcon, ImageOff } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Input } from "../ui/input";
import { UserMenu } from "./UserMenu";
import { Skeleton } from "../ui/skeleton";
import { trpc } from "~/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { ProductType } from "~/types/product";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

type NavbarUser = {
  id: string;
  name: string | null;
  email: string;
};

type NavbarProps = {
  isLoadingUser: boolean;
  isAuthenticated: boolean;
  user: NavbarUser | null;
  onSignOut: () => void;
  isSigningOut: boolean;
};

export function Navbar({
  isLoadingUser,
  isAuthenticated,
  user,
  onSignOut,
  isSigningOut,
}: NavbarProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { data: cartCountData, isLoading: isLoadingCartCount } = trpc.cart.count.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
    }
  );
  
  const itemCount = isAuthenticated && cartCountData && typeof cartCountData.itemCount === 'number' ? cartCountData.itemCount : 0;

  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
  } = trpc.product.list.useQuery(
    { searchTerm: debouncedSearchTerm },
    {
      enabled: debouncedSearchTerm.length > 1,
      // keepPreviousData: true,
    }
  );

  const safeSearchResults: ProductType[] = searchResults || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 1) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setSearchTerm("");
    setShowSearchResults(false);
  };
  
  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSearchResults(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleRedirectQty = () => { navigate("/cart"); };
  const redirectLogin = () => { navigate("/login"); };
  const redirectRegister = () => { navigate("/register"); };

  const renderAuthSection = () => {
    if (isLoadingUser) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20 lg:flex hidden" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      return <UserMenu user={user} onSignOut={onSignOut} isSigningOut={isSigningOut} />;
    }

    return (
      <>
        <Button onClick={redirectLogin} variant={"outline"} className="hover:cursor-pointer h-9 px-4 text-sm" size={"sm"}>Sign In</Button>
        <Button onClick={redirectRegister} className="hover:cursor-pointer bg-amber-600 hover:bg-amber-500 lg:flex hidden h-9 px-4 text-sm" size={"sm"}>Sign Up</Button>
      </>
    );
  };

  return (
    <header className="w-full bg-white fixed z-50 lg:px-20 md:px-10 px-5 lg:h-auto md:h-[120px] h-[88px] pt-3 pb-3 shadow-md">
      <div className="lg:flex md:flex hidden items-center justify-between w-full mb-3">
        <div className="flex items-center gap-4">
          <span className="text-xs">Customer Service: <strong>+1 (800) 123-4567</strong></span>
          <span className="text-xs">Free Shipping on Orders Over <strong className="text-lime-600">$100</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to={"/help"} className="hover:underline text-xs">Help</Link>
          <Link to={"/track-order"} className="hover:underline text-xs">Track Order</Link>
        </div>
      </div>
      <Separator className="lg:block md:block hidden mb-3" />

      <div className="flex items-center justify-between w-full lg:max-w-none mx-auto gap-4">
        <div className="lg:block hidden">
          <Link to={"/"} className="font-black italic text-2xl text-lime-600">Tradoora</Link>
        </div>

        <div className="flex-grow lg:mx-4 relative" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products, categories, etc."
              className="w-full pl-9 placeholder:text-sm text-sm h-10"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => searchTerm.length > 1 && setShowSearchResults(true)}
            />
            {searchTerm && (
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                >
                    <XIcon className="h-4 w-4"/>
                </Button>
            )}
          </div>

          {showSearchResults && debouncedSearchTerm.length > 1 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              {(isLoadingSearch || isFetchingSearch) && searchTerm.length > 1 && (
                <div className="p-4 text-sm text-gray-500">
                    {[...Array(3)].map((_,i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                            <Skeleton className="w-10 h-10 rounded"/>
                            <Skeleton className="h-4 flex-grow"/>
                        </div>
                    ))}
                </div>
              )}
              {!isLoadingSearch && !isFetchingSearch && safeSearchResults.length > 0 && (
                <ul>
                  {safeSearchResults.map((product) => (
                    <li
                      key={product.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSearchResultClick(product.slug)}
                      role="option"
                      aria-selected="false"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded">
                          <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? 'Product'} />
                          <AvatarFallback className="rounded bg-gray-100">
                            {product.imageUrl ? product.name?.charAt(0) : <ImageOff className="h-5 w-5 text-gray-400"/>}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700 truncate">{product.name}</span>
                      </div>
                    </li>
                  ))}
                   <li className="p-3 text-center">
                        <Button variant="link" className="text-sm text-amber-600" onClick={() => {
                            navigate(`/product?search=${encodeURIComponent(debouncedSearchTerm)}`);
                            setShowSearchResults(false);
                            setSearchTerm("");
                        }}>
                            View all results for "{debouncedSearchTerm}"
                        </Button>
                    </li>
                </ul>
              )}
              {!isLoadingSearch && !isFetchingSearch && safeSearchResults.length === 0 && debouncedSearchTerm.length > 1 && (
                <div className="p-4 text-sm text-center text-gray-500">
                  No products found for "{debouncedSearchTerm}".
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleRedirectQty}
            variant={"ghost"} 
            className="hover:cursor-pointer lg:flex md:flex hidden relative text-gray-600 hover:text-amber-600"
            size={"icon"}
          >
            <ShoppingCart className="h-5 w-5" />
            {isAuthenticated && !isLoadingCartCount && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Button>

          <Separator orientation="vertical" className="h-6 text-gray-400 lg:flex md:flex hidden" />
          
          <div className="lg:flex md:flex hidden items-center gap-2">
            {renderAuthSection()}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"ghost"} className="hover:cursor-pointer lg:hidden md:hidden flex p-2 text-gray-600 hover:text-amber-600" size={"icon"}>
                <AlignJustify className="h-5 w-5"/>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-lime-600 text-xl font-black italic">Tradoora</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 text-sm font-medium px-2">
                <Link to={"/"} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary">Home</Link>
                <Link to={"/product"} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary">Product </Link>
              </nav>
              <Separator className="my-4" />
              <div className="px-4 space-y-2">
                {isLoadingUser ? (
                   <Skeleton className="h-9 w-full" />
                ) : isAuthenticated && user ? (
                  <>
                    <p className="text-sm font-medium px-2">{user.name}</p>
                    <p className="text-xs text-muted-foreground px-2 mb-2">{user.email}</p>
                    <Button variant="outline" className="w-full" onClick={onSignOut} disabled={isSigningOut}>
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={redirectLogin}>Sign In</Button>
                    <Button className="w-full bg-amber-600 hover:bg-amber-500" onClick={redirectRegister}>Sign Up</Button>
                  </>
                )}
              </div>
               <Separator className="my-4" />
               <div className="px-4 space-y-2 text-sm">
                <Link to="/help" className="block p-2 rounded-md text-gray-700 hover:bg-gray-100">Help</Link>
                <Link to="/track-order" className="block p-2 rounded-md text-gray-700 hover:bg-gray-100">Track Order</Link>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <nav className="lg:flex md:flex hidden items-center text-sm gap-6 lg:max-w-none w-full mx-auto pt-2 pb-1 overflow-x-auto">
        {[ "Home", "Product"].map(item => (
           <Link
            key={item}
            className="font-medium text-gray-600 hover:text-amber-600 whitespace-nowrap"
            to={item === "Home" ? "/" : `/product`}
          >
            {item}
          </Link>
        ))}
      </nav>
    </header>
  );
}