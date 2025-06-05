import { MiddlewareRoute, validateAndTransformQuery, authenticate } from "@medusajs/framework"
import { StoreGetProductsParams } from "@medusajs/medusa/api/store/products/validators"
import * as QueryConfig from "../query-config"


export const storeProductAttributesMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],

    matcher: '/store/plugin/attributes/products/:id',
    middlewares: [

      authenticate("customer", ["session", "bearer"], {
        allowUnauthenticated: true,
      }),

      validateAndTransformQuery(
        StoreGetProductsParams,
        QueryConfig.retrieveProductQueryConfig
      )
    ]
  }
]
