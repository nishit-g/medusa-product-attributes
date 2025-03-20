import { MiddlewareRoute } from "@medusajs/framework";
import { adminAttributeRoutesMiddlewares } from "./plugin/attributes/middlewares";

export const adminRoutesMiddlewares: MiddlewareRoute[] = [
    ...adminAttributeRoutesMiddlewares
]