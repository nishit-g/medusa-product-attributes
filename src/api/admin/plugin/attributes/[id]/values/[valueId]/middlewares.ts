import { MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework"
import { AdminGetAttributeValueParams } from "../../../validators"
import { retrieveAttributeValueQueryConfig } from "../../../query-config"

export const adminAttributeValueMiddlewares: MiddlewareRoute[] = [

  {
    method: ['GET'],
    matcher: '/admin/plugin/attributes/:id/values/:valueId',
    middlewares: [
      validateAndTransformQuery(
        AdminGetAttributeValueParams,
        retrieveAttributeValueQueryConfig
      )
    ]
  },
  {
    method: ['DELETE'],
    matcher: '/admin/plugin/attributes/:id/values/:valueId',
    middlewares: []
  }
]
