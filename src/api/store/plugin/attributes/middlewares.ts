import { clearFiltersByKey, MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework";
import { storeAttributesBaseRoute } from "../../../utils/constants";
import { StoreGetAttributesParams } from "./validators";
import * as QueryConfig from './query-config'
import { applyCategoryFilterIfNecessary } from "../../../utils/middlewares";
import { storeAttributesProductsMiddlewares } from "./products/middlewares";

export const storeAttributesMiddlewaresRoute: MiddlewareRoute[] = [
    {
        methods: ['GET'],
        matcher: storeAttributesBaseRoute,
        middlewares: [
            validateAndTransformQuery(
                StoreGetAttributesParams,
                QueryConfig.storeListAttributesQueryConfig
            ),
            applyCategoryFilterIfNecessary(),
            clearFiltersByKey(['categories']),
        ]
    },
    ...storeAttributesProductsMiddlewares,
]