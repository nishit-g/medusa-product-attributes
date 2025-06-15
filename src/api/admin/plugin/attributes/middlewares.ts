import { MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import { AdminCreateAttribute, AdminCreateAttributeValue, AdminGetAttributeParams, AdminGetAttributesParams, AdminGetAttributeValueParams, AdminGetAttributeValuesParams, AdminUpdateAttribute } from "./validators";
import * as QueryConfig from './query-config'
import { adminAttributesRoutePath } from "../../../utils/constants";
import { z } from "zod";

const BulkDeleteAttributesSchema = z.object({
    ids: z.array(z.string()).min(1, "At least one attribute ID is required")
});

export const adminAttributeRoutesMiddlewares: MiddlewareRoute[] = [
    {
        method: ['GET'],
        matcher: adminAttributesRoutePath,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributesParams,
                QueryConfig.listAttributeQueryConfig,
            )
        ]
    },
    {
        method: ['POST'],
        matcher: adminAttributesRoutePath,
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
        matcher: `${adminAttributesRoutePath}/:id`,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributeParams,
                QueryConfig.retrieveAttributeQueryConfig
            )
        ]
    },
    {
        method: ['POST'],
        matcher: `${adminAttributesRoutePath}/:id`,
        middlewares: [
            validateAndTransformBody(AdminUpdateAttribute),
            validateAndTransformQuery(
                AdminGetAttributeParams,
                QueryConfig.retrieveAttributeQueryConfig
            )
        ]
    },
    {
        method: ['DELETE'],
        matcher: `${adminAttributesRoutePath}/:id`,
        middlewares: []
    },
    {
        method: ['POST'],
        matcher: `${adminAttributesRoutePath}/bulk-delete`,
        middlewares: [
            validateAndTransformBody(BulkDeleteAttributesSchema)
        ]
    },
    {
        method: ['GET'],
        matcher: `${adminAttributesRoutePath}/:id/values`,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributeValuesParams,
                QueryConfig.listAttributeValueQueryConfig,
            )
        ]
    },
    {
        method: ['POST'],
        matcher: `${adminAttributesRoutePath}/:id/values`,
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
        matcher: `${adminAttributesRoutePath}/:id/values/:valueId`,
        middlewares: [
            validateAndTransformQuery(
                AdminGetAttributeValueParams,
                QueryConfig.retrieveAttributeValueQueryConfig
            )
        ]
    },
]
