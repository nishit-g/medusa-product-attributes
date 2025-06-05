import { MiddlewareRoute } from "@medusajs/framework"
import { productAttributesMiddlewares } from "./[id]/attributes/middlewares"

export const adminProductsMiddlewares: MiddlewareRoute[] = [
  ...productAttributesMiddlewares,
]
