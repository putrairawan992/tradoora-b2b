import { Outlet, Link, useNavigate } from "react-router"; // Pastikan menggunakan react-router-dom
import type { Route } from "./+types/MainLayout";
import { Navbar } from "~/components/common/Navbar";
import { Footer } from "~/components/common/Footer";
import { trpc } from "~/lib/trpc";
import toast from "react-hot-toast";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Tradoora - Your Ultimate Online Shopping Destination" },
        { 
            name: "description", 
            content: "Discover a seamless shopping experience at Tradoora. Find amazing deals on fashion, electronics, home essentials and more. Shop smart, shop easy with Tradoora."
        },
        {
            name: "keywords",
            content: "online shopping, e-commerce, shopping platform, best deals, fashion, electronics, home essentials"
        }
    ];
}

export default function MainLayout() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: userData, isLoading: isLoadingUser, error: userFetchError } = trpc.user.me.useQuery(
    undefined,
    {
      retry: (failureCount, error) => {
        if ((error as any)?.data?.code === 'UNAUTHORIZED') {
          return false;
        }
        return failureCount < 2; 
      },
    }
  );

  const logoutMutation = trpc.user.logout.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Logged out successfully!");
      } else {
        toast.error(data.message || "Logout failed.");
      }
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      utils.user.me.invalidate(); 
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred during logout.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      utils.user.me.invalidate();
      navigate("/login");
    },
  });

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!userData?.success;
  const currentUser = isAuthenticated ? {
    id: (userData as any).id,
    name: (userData as any).name,
    email: (userData as any).email
  } : null;

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar
        isLoadingUser={isLoadingUser}
        isAuthenticated={isAuthenticated}
        user={currentUser}
        onSignOut={handleSignOut}
        isSigningOut={logoutMutation.isPending}
      />
      <div className="flex-grow lg:pt-8 pt-0 md:pt-7"> 
        <Outlet context={{ isAuthenticated, user: currentUser, isLoadingUser }} /> 
      </div>
      <Footer/>
    </main>
  );
}