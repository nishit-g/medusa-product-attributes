import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";
import { GetAttributesParams, StoreGetAttributeParamsDirectFields } from "../../../utils/common-validators";
import { applyAndAndOrOperators } from "@medusajs/medusa/api/utils/common-validators/common";

export const StoreGetAttributesParamsFields = GetAttributesParams.strict();

export type StoreGetAttributesParamsType = z.infer<typeof StoreGetAttributesParams>
export const StoreGetAttributesParams = createFindParams({
  offset: 0,
  limit: 50,
})
  .merge(StoreGetAttributesParamsFields)
  .merge(applyAndAndOrOperators(StoreGetAttributeParamsDirectFields).strict());
