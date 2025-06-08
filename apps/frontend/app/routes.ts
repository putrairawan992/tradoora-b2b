import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("layouts/MainLayout.tsx", [
        index("routes/_index.tsx"), 
        route("/product", "routes/products/index.tsx"),
        route("/product/:slug", "routes/products/$slug.tsx"),
        route("/cart", "routes/cart.tsx")
    ]),
    route('/login', 'routes/auth/login.tsx'),
    route('/register', 'routes/auth/register.tsx'),
    layout("layouts/UserLayout.tsx", [
        route("/auth/welcome", "routes/user/index.tsx")
    ]),
    route("/success", 'routes/payment/success.tsx'),
    route("/failed", 'routes/payment/error.tsx')
] satisfies RouteConfig;