// src/workflows/attribute/steps/delete-attribute.ts
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import AttributeModuleService from "../../../modules/attribute/service"
import attributeProductCategory from "../../../links/attribute-product-category"
import attributeValueProduct from "../../../links/attribute-value-product"

export const deleteAttributeStepId = 'delete-attribute'

interface CategoryLink {
    attribute_id: string
    product_category_id: string
}

interface ValueLink {
    attribute_value_id: string
    product_id: string
}

export const deleteAttributeStep = createStep(
    deleteAttributeStepId,
    async (ids: string[], { container }) => {
        const attributeModuleService = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

        // Store the attributes before deletion for potential rollback
        const attributesToDelete = await attributeModuleService.listAttributes({
            id: ids
        })

        // First, get all attribute values for these attributes
        const attributeValues = await attributeModuleService.listAttributeValues({
            attribute_id: ids
        })

        const attributeValueIds = attributeValues.map(av => av.id)

        // Query category links directly by attribute_id
        const { data: categoryLinks } = await query.graph({
            entity: attributeProductCategory.entryPoint,
            fields: ["attribute_id", "product_category_id"],
            filters: {
                attribute_id: ids
            }
        }) as { data: CategoryLink[] }

        // Query attribute value links by attribute_value_id (not nested)
        let valueLinks: ValueLink[] = []
        if (attributeValueIds.length > 0) {
            const { data: valueLinkData } = await query.graph({
                entity: attributeValueProduct.entryPoint,
                fields: ["attribute_value_id", "product_id"],
                filters: {
                    attribute_value_id: attributeValueIds
                }
            }) as { data: ValueLink[] }
            valueLinks = valueLinkData
        }

        // Delete all links first
        if (categoryLinks.length > 0) {
            await remoteLink.dismiss(
                categoryLinks.map(link => ({
                    [ATTRIBUTE_MODULE]: { attribute_id: link.attribute_id },
                    [Modules.PRODUCT]: { product_category_id: link.product_category_id }
                }))
            )
        }

        if (valueLinks.length > 0) {
            await remoteLink.dismiss(
                valueLinks.map(link => ({
                    [ATTRIBUTE_MODULE]: { attribute_value_id: link.attribute_value_id },
                    [Modules.PRODUCT]: { product_id: link.product_id }
                }))
            )
        }

        // Soft delete the attributes (this will cascade to attribute values)
        await attributeModuleService.softDeleteAttributes(ids)

        return new StepResponse(
            { deletedIds: ids, count: ids.length },
            {
                attributesToDelete,
                deletedIds: ids,
                categoryLinks,
                valueLinks,
                attributeValueIds
            }
        )
    },
    async (rollbackData, { container }) => {
        if (!rollbackData?.deletedIds?.length) {
            return
        }

        const attributeModuleService = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)
        const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

        // Restore the soft-deleted attributes
        await attributeModuleService.restoreAttributes(rollbackData.deletedIds)

        // Restore category links
        if (rollbackData.categoryLinks?.length > 0) {
            await remoteLink.create(
                rollbackData.categoryLinks.map((link: CategoryLink) => ({
                    [ATTRIBUTE_MODULE]: { attribute_id: link.attribute_id },
                    [Modules.PRODUCT]: { product_category_id: link.product_category_id }
                }))
            )
        }

        // Restore value links
        if (rollbackData.valueLinks?.length > 0) {
            await remoteLink.create(
                rollbackData.valueLinks.map((link: ValueLink) => ({
                    [ATTRIBUTE_MODULE]: { attribute_value_id: link.attribute_value_id },
                    [Modules.PRODUCT]: { product_id: link.product_id }
                }))
            )
        }
    }
)
