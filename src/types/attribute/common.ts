/**
 * @interface
 * 
 * The data to create the attribute value.
 */
export interface CreateAttributeValueDTO {
    value: string
    rank: number
    attribute_id: string
    metadata?: Record<string, unknown>
}