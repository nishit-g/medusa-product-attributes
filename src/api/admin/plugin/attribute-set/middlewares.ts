import { AdminCreateAttributeSet, AdminGetAttributeSetParams } from "./validators";
import { MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";

import { retrieveAttributeSetQueryConfig } from "./query-config";

export const adminAttributeSetMiddlewares: MiddlewareRoute[] = [
    {
        matcher: '/admin/plugin/attribute-set',
        methods: ['POST'],
        middlewares: [
            validateAndTransformQuery(AdminGetAttributeSetParams, retrieveAttributeSetQueryConfig),
            validateAndTransformBody(AdminCreateAttributeSet)
        ]
    }
]