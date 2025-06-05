import { MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework"
import {  AdminGetAttributeSetParams, AdminUpdateAttributeSet } from "../validators"
import { retrieveAttributeSetQueryConfig } from "../query-config"

export const adminAttributeSetDetailMiddlewares: MiddlewareRoute[] = [
  {
    method: ['GET'],
    matcher: '/admin/plugin/attribute-set/:id',

    middlewares: [
      validateAndTransformQuery(
        AdminGetAttributeSetParams,
        retrieveAttributeSetQueryConfig
      )
    ]
  },
  {

    method: ['POST'],
    matcher: '/admin/plugin/attribute-set/:id',
    middlewares: [
      // validateAndTransformBody(AdminUpdateAttributeSetType),
      validateAndTransformBody(AdminUpdateAttributeSet),

      validateAndTransformQuery(
        AdminGetAttributeSetParams,
        retrieveAttributeSetQueryConfig

      )
    ]
  },
  {
    method: ['DELETE'],
    matcher: '/admin/plugin/attribute-set/:id',
    middlewares: []
  }
]
