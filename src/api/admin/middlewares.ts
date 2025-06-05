import { MiddlewareRoute } from "@medusajs/framework";
import { adminAttributeRoutesMiddlewares } from "./plugin/attributes/middlewares";
import { adminAttributeSetMiddlewares } from "./plugin/attribute-set/middlewares";
import { adminProductsMiddlewares } from "./products/middlewares";

export const adminRoutesMiddlewares: MiddlewareRoute[] = [
    ...adminAttributeRoutesMiddlewares,
    ...adminAttributeSetMiddlewares,
    ...adminProductsMiddlewares,
]
