import { MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import { AdminCreateAttribute, AdminCreateAttributeValue, AdminGetAttributeParams, AdminGetAttributesParams, AdminGetAttributeValueParams, AdminGetAttributeValuesParams, AdminUpdateAttribute } from "./validators";
import * as QueryConfig from './query-config'
import { attributesRoutePath } from "./utils";

export const adminAttributeRoutesMiddlewares: MiddlewareRoute[] = [
    {
        method: ['GET'],
        matcher: attributesRoutePath,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributesParams,
                QueryConfig.listAttributeQueryConfig,
            )
        ]
    },
    {
        method: ['POST'],
        matcher: attributesRoutePath,
        middlewares: [
            validateAndTransformBody(AdminCreateAttribute),
            validateAndTransformQuery(
                AdminGetAttributeParams,
                QueryConfig.retrieveAttributeQueryConfig
            )
        ]
    },
    {
        method: ['GET'],
        matcher: `${attributesRoutePath}/:id`,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributeParams,
                QueryConfig.retrieveAttributeQueryConfig
            )
        ]
    },
    {
        method: ['POST'],
        matcher: `${attributesRoutePath}/:id`,
        middlewares: [
            validateAndTransformBody(AdminUpdateAttribute),
            validateAndTransformQuery(
                AdminGetAttributeParams,
                QueryConfig.retrieveAttributeQueryConfig
            )
        ]
    },
    {
        method: ['GET'],
        matcher: `${attributesRoutePath}/:id/values`,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributeValuesParams,
                QueryConfig.listAttributeValueQueryConfig,
            )
        ]
    },
    {
        method: ['POST'],
        matcher: `${attributesRoutePath}/:id/values`,
        middlewares: [
            validateAndTransformBody(AdminCreateAttributeValue),
            validateAndTransformQuery(
                AdminGetAttributeValueParams,
                QueryConfig.retrieveAttributeValueQueryConfig,
            )
        ]
    },
    {
        method: ['GET'],
        matcher: `${attributesRoutePath}/:id/values/:valueId`,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributeValueParams,
                QueryConfig.retrieveAttributeValueQueryConfig
            )
        ]
    },
]