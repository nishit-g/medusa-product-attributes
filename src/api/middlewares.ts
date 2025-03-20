import { defineMiddlewares } from "@medusajs/framework";
import { adminRoutesMiddlewares } from "./admin/middlewares";

export default defineMiddlewares({
    routes: [
        ...adminRoutesMiddlewares
    ]
})