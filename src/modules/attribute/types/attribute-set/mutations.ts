export type CreateAttributeSetDTO = {
    name: string
    handle?: string
    description?: string
    metadata?: Record<string, unknown> | null
    attributes?: string[]
    categories?: string[]
}