import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { StoreGetAttributesParamsType } from "../store/plugin/attributes/validators";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import attributeProductCategory from "../../links/attribute-product-category";

// TODO: find out if Medusa has a generic mechanism to apply query filters
// on related entities from different modules. Also, if not, make
// this more robust, since currently it doesn't manage $and / $or
// for linked modules
export function applyCategoryFilterIfNecessary() {
    return async function(req: MedusaRequest<StoreGetAttributesParamsType>, _: MedusaResponse, next: MedusaNextFunction) {
        const filterableFields = req.filterableFields ?? {}

        const categories = filterableFields.categories as string[] | undefined
        if (!categories?.length) {
            return next()
        }

        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        const { data: attributeCategories } = await query.graph({
            entity: attributeProductCategory.entryPoint,
            fields: ['attribute_id'],
            filters: {
                attribute_id: filterableFields.id,
                product_category_id: categories
            }
        })

        if (!attributeCategories.length) {
            // TODO: would it be better to return response here with empty attributes?
            // as otherwise, if no attribute is linked to the category, user may think 
            // whatever was queried is linked to the category
            return next()
        } 

        const attributeIds = attributeCategories.map(attrCat => attrCat.attribute_id)
        const userRequestedAttributeIds = (filterableFields.id ?? []) as string[]

        req.filterableFields = {
            ...filterableFields,
            id: userRequestedAttributeIds.concat(attributeIds)
        }
        return next()
    }
}