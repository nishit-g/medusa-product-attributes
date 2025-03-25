import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { arrayDifference, ContainerRegistrationKeys, deduplicate } from "@medusajs/framework/utils";
import attributeProductCategory from "../../links/attribute-product-category";

export const addGlobalAttributesIfNecessary = () => async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const filterableFields = req.filterableFields || {}
    const shouldIncludeGlobals = filterableFields.include_globals

    if(!shouldIncludeGlobals) {
        return next()
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: allAttributes } = await query.graph({
        entity: 'attribute',
        fields: ['id']
    })
    const { data: attributesWithCategories } = await query.graph({
        entity: attributeProductCategory.entryPoint,
        fields: ['attribute_id']
    })

    const alreadyFilteredAttributeIds = (filterableFields.id || []) as string[]
    const allAttributesIds = allAttributes.map(attr => attr.id)
    const attributesWithCategoriesIds = deduplicate(attributesWithCategories.map(attrCat => attrCat.attribute_id))
    req.filterableFields.id = [
        ...alreadyFilteredAttributeIds,
        ...arrayDifference(allAttributesIds, attributesWithCategoriesIds)
    ]
    return next()
}