import { createSelectParams } from '@medusajs/medusa/api/utils/validators'
import { z } from 'zod'

const AdminBaseAttributeSet = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    handle: z.string().optional(),
    metadata: z.record(z.unknown()).nullish(),
    attributes: z.array(z.string()).optional(),
}).strict()

export type AdminCreateAttributeSetType = z.infer<typeof AdminCreateAttributeSet>
export const AdminCreateAttributeSet = AdminBaseAttributeSet.merge(z.object({
    name: z.string(),
})).strict()

export type AdminUpdateAttributeSetType = z.infer<typeof AdminUpdateAttributeSet>
export const AdminUpdateAttributeSet = AdminBaseAttributeSet

export const AdminGetAttributeSetParams = createSelectParams()

