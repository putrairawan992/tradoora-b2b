import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { trpc } from "~/lib/trpc";
import toast from 'react-hot-toast';

export default function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const utils = trpc.useUtils();

    const loginMutation = trpc.user.login.useMutation({
        onSuccess: (data) => {
            if (
                data.success &&
                "token" in data &&
                typeof data.token === "string"
            ) {
                console.log("Login successful", data);
                localStorage.setItem('authToken', data.token);
                if ("user" in data && data.user) {
                    localStorage.setItem('userData', JSON.stringify(data.user));
                }
                
                utils.user.me.invalidate(); 
                
                toast.success(data.message || "Login successful!");
                navigate('/auth/welcome');
            } else {
                toast.error(data.message || "Login failed. Please try again.");
            }
        },
        onError: (error) => {
            toast.error(error.message || "An unexpected error occurred.");
            console.error("Login error", error);
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    const isLoading = loginMutation.isPending;

    return (
        <main className="flex items-center justify-center w-full min-h-screen p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            <div className="w-full max-w-sm">
                <Card className="w-full shadow-xl border-0 bg-white/90 backdrop-blur-md">
                    <CardHeader className="text-center space-y-2 pb-6">
                        <CardTitle className="text-2xl font-bold text-amber-700">Welcome Back</CardTitle>
                        <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/70"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white/70"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                                    <span className="text-gray-600">Remember me</span>
                                    </label>
                                <button type="button" className="text-amber-600 hover:text-amber-700 font-medium">
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="text-center text-sm text-gray-600 justify-center flex pt-6">
                        Don't have an account?
                        <Link to="/register" className="ml-1 text-amber-600 hover:text-amber-700 font-medium">
                            Sign up
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}