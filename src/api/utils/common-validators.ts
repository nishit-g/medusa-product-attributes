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
        categories: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .merge(StoreGetAttributeParamsDirectFields)