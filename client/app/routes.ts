import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";


export default [
    index("routes/home.tsx"),

    route("collection/all", "routes/collection.tsx"),
    route("collection/:productid", "routes/item.tsx"),

    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
    route("checkout", "routes/checkout.tsx")
    
] satisfies RouteConfig;
