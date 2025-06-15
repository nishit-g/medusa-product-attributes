import { createOperatorMap } from '@medusajs/medusa/api/utils/validators'
import { z } from 'zod'

export const StoreGetAttributeParamsDirectFields = z.object({
    id: z.union([z.string(), z.array(z.string())]).optional(),
    name: z.union([z.string(), z.array(z.string())]).optional(),
    description: z.union([z.string(), z.array(z.string())]).optional(),
    handle: z.union([z.string(), z.array(z.string())]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
    deleted_at: createOperatorMap().optional(),
})

export const GetAttributesParams = z
    .object({
        product_category_id: z.union([z.string(), z.array(z.string())]).optional(),
        include_globals: z.preprocess(
            (val) => {
                return val === 'true'
            },
            z.boolean().default(true),
        )
    })
    .merge(StoreGetAttributeParamsDirectFields)
