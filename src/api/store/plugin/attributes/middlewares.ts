import {
  clearFiltersByKey,
  maybeApplyLinkFilter,
  MiddlewareRoute,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { storeAttributesBaseRoute } from "../../../utils/constants";
import { StoreGetAttributesParams } from "./validators";
import * as QueryConfig from "./query-config";
import { storeAttributesProductsMiddlewares } from "./products/middlewares";
import attributeProductCategory from "../../../../links/attribute-product-category";
import { addGlobalAttributesIfNecessary } from "../../../utils/middlewares";

export const storeAttributesMiddlewaresRoute: MiddlewareRoute[] = [
  {
    methods: ["GET"],
    matcher: storeAttributesBaseRoute,
    middlewares: [
      validateAndTransformQuery(
        StoreGetAttributesParams,
        QueryConfig.storeListAttributesQueryConfig
      ),
      maybeApplyLinkFilter({
        entryPoint: attributeProductCategory.entryPoint,
        resourceId: 'attribute_id',
        filterableField: 'product_category_id'
      }),
      addGlobalAttributesIfNecessary(),
      clearFiltersByKey(['include_globals']),
    ],
  },
  ...storeAttributesProductsMiddlewares,
];
