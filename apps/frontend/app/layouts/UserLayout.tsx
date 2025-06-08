import { LogOut, User as UserIcon } from "lucide-react";
import { Outlet, Link, useNavigate } from "react-router"; // Pastikan ini benar
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { CardDescription, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function UserLayout() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: userData, isLoading: isLoadingUser } = trpc.user.me.useQuery(
    undefined,
    {
      retry: false,
      staleTime: 5 * 60 * 1000,
    }
  );

useEffect(() => {
  if (!isLoadingUser) {
    if (!userData || !userData.success) {
      const timer = setTimeout(() => {
        if (!utils.user.me.getData()?.success) { 
          toast.error("Session expired or unauthorized. Please login again.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          utils.user.me.invalidate(); 
          navigate("/login", { replace: true });
        }
      }, 100); 
      return () => clearTimeout(timer);
    }
  }
}, [isLoadingUser, userData, navigate, utils]);

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
      navigate("/login");
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

  if (isLoadingUser || !userData || !userData.success) {
    return (
      <main>
        <nav className="w-full border-b h-auto bg-white shadow-sm">
          <div className="max-w-2xl w-full mx-auto p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </nav>
        <div className="lg:max-w-2xl md:max-w-xl lg:px-0 md:px-3 px-4 w-full mx-auto py-6">
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <p>Loading session...</p>
          </div>
        </div>
      </main>
    );
  }

  type UserSuccess = { id: string; name: string | null; email: string; message: string; success: true };
  const isUserSuccess = (data: typeof userData): data is UserSuccess =>
    !!data && data.success && "id" in data && typeof data.id === "string";

  const userId = isUserSuccess(userData) ? userData.id : "";
  const userName = isUserSuccess(userData) ? userData.name : "";
  const userEmail = isUserSuccess(userData) ? userData.email : "";
  const fallbackName = userName?.substring(0, 2).toUpperCase() || "??";

  return (
    <main>
      <nav className="w-full border-b h-auto bg-white shadow-sm">
        <div className="max-w-2xl w-full mx-auto p-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition-colors">
                {fallbackName}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm group-hover:text-amber-700 transition-colors">
                {userName || "User"}
              </CardTitle>
              <CardDescription className="text-xs">
                {userEmail}
              </CardDescription>
            </div>
          </Link>
          
          <div>
            <Button
              variant={"outline"}
              size={"sm"}
              className="text-xs h-9 px-3 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleSignOut}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </nav>
      <div className="lg:max-w-2xl md:max-w-xl lg:px-0 md:px-3 px-4 w-full mx-auto py-6">
        {/* userId di sini dijamin string karena userData.success sudah true */}
        <Outlet context={{ userId }} />
      </div>
    </main>
  );
}