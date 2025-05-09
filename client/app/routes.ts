import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";
import CurrencySelector from "./contexts/currency";

export default [
    index("routes/home.tsx"),

    route("collection/all", "routes/collection.tsx"),
    route("collection/:productid", "routes/item.tsx"),

    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
    
] satisfies RouteConfig;
