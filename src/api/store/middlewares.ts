import { MiddlewareRoute } from "@medusajs/framework";
import { storeAttributesMiddlewaresRoute } from "./plugin/attributes/middlewares";

export const storeMiddlewaresRoutes: MiddlewareRoute[] = [
    ...storeAttributesMiddlewaresRoute
]