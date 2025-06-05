import { MiddlewareRoute, validateAndTransformQuery, authenticate } from "@medusajs/framework"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "zod"

const StoreGetAttributeFiltersParams = createFindParams().merge(
  z.object({
    category_id: z.string().optional(),
    include_counts: z.boolean().default(true).optional(),
  })
)

export const storeAttributeFiltersMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/store/plugin/attributes/filters',
    middlewares: [
      authenticate("customer", ["session", "bearer"], {
        allowUnauthenticated: true,
      }),
      validateAndTransformQuery(StoreGetAttributeFiltersParams, {
        defaults: ['id', 'name', 'handle', '*possible_values'],
        isList: true,
        defaultLimit: 50,
      })
    ]
  }
]
