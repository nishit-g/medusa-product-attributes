import {
  StoreGetProductsParamsFields,
  StoreGetProductVariantsParamsFields,
} from "@medusajs/medusa/api/store/products/validators";
import {
  applyAndAndOrOperators,
  recursivelyNormalizeSchema,
} from "@medusajs/medusa/api/utils/common-validators/common";
import {
  StoreGetProductParamsDirectFields,
  transformProductParams,
} from "@medusajs/medusa/api/utils/common-validators/index";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

//TODO: this is messy, but since Medusa exports an effect, the only way (AFAIK) to extend the schema
// and to keep the logic of the effects at the same time, the only way is to recreate
// the Medusa zod object, merge with the custom one and apply the effect
const OriginalStoreGetProductsParamsWithoutEffect = createFindParams({
  offset: 0,
  limit: 50,
})
  .merge(StoreGetProductsParamsFields)
  .merge(
    z
      .object({
        variants: z
          .object({
            options: z
              .object({
                value: z.string().optional(),
                option_id: z.string().optional(),
              })
              .optional(),
          })
          .merge(applyAndAndOrOperators(StoreGetProductVariantsParamsFields))
          .optional(),
      })
      .merge(applyAndAndOrOperators(StoreGetProductParamsDirectFields))
      .strict()
  );

const CustomStoreGetProductsParams = z.object({
  attribute_value_id: z.array(z.string()).optional(),
});

export type ExtendedStoreGetProductsParamsType = z.infer<
  typeof OriginalStoreGetProductsParamsWithoutEffect
>;
export const ExtendedStoreGetProductsParams =
  OriginalStoreGetProductsParamsWithoutEffect.merge(
    CustomStoreGetProductsParams
  )
    // .merge(applyAndAndOrOperators(CustomStoreGetProductsParams))
    .transform(recursivelyNormalizeSchema(transformProductParams));
