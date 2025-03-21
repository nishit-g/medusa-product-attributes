import { defineMiddlewares } from "@medusajs/framework";
import { adminRoutesMiddlewares } from "./admin/middlewares";
import { storeMiddlewaresRoutes } from "./store/middlewares";

export default defineMiddlewares({
    routes: [
        ...adminRoutesMiddlewares,
        ...storeMiddlewaresRoutes,
    ]
})