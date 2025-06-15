// src/modules/attribute/types/attribute/common.ts
import { AdminCreateAttributeType } from "../../../../api/admin/plugin/attributes/validators"

export type CreateAttributesWorkflowInput = {
    attributes: AdminCreateAttributeType[]
}

// Remove product_category_ids from the step input since it's handled via links
export type CreateAttributeStepInput = Omit<AdminCreateAttributeType, 'product_category_ids'>[]

/**
 * @interface
 *
 * The data to update the attribute.
 */
export interface UpdateAttributeDTO {
    /**
     * The id of the attribute to update.
     */
    id: string

    /**
     * The name of the attribute.
     */
    name?: string

    /**
     * The description of the attribute.
     */
    description?: string

    /**
     * Whether the attribute can be used to filter products.
     */
    is_filterable?: boolean

    /**
     * The handle of the attribute. The handle can be used to create slug URL paths.
     * If not supplied, the value of the `handle` attribute of the attribute is set to the slug version of the `name` property.
     */
    handle?: string

    /**
     * Holds custom data in key-value pairs.
     */
    metadata?: Record<string, unknown>

    /**
     * The associated possible values to update/create
     */
    possible_values?: UpsertAttributeValueDTO[]

    /**
     * The associated product categories (handled via links, not direct DB relationship)
     * This field is accepted in API but processed separately from the core attribute data
     */
    product_category_ids?: string[]
}

/**
 * @interface
 *
 * The data to update or create an attribute value.
 */
export interface UpsertAttributeValueDTO {
    /**
     * The id of the attribute value to update.
     */
    id?: string
    /**
     * The value of the attribute value.
     */
    value?: string
    /**
     * The rank of the attribute value. Useful to visually order it on dropdowns.
     */
    rank?: number
    /**
     * Holds custom data in key-value pairs.
     */
    metadata?: Record<string, unknown>
    /**
     * The id of the associated attribute.
     */
    attribute_id?: string
}

/**
 * @interface
 *
 * The data to update an attribute value.
 */
export interface UpdateAttributeValueDTO {
    /**
     * The id of the attribute value to update.
     */
    id: string

    /**
     * The value of the attribute value.
     */
    value?: string

    /**
     * The rank of the attribute value. Useful to visually order it on dropdowns.
     */
    rank?: number

    /**
     * Holds custom data in key-value pairs.
     */
    metadata?: Record<string, unknown>

    /**
     * The id of the associated attribute.
     */
    attribute_id?: string
}
