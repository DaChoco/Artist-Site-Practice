import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("collection/all", "routes/collection.tsx")
] satisfies RouteConfig;
