import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { AdminGetAttributeValueParamsType } from "../../../validators";
import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest<AdminGetAttributeValueParamsType>, res: MedusaResponse) => {
    const attributeId = req.params.valueId
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: [attributeValue] } = await query.graph({
        entity: 'attribute_value',
        ...req.queryConfig,
        filters: {
            ...req.filterableFields,
            id: attributeId
        }
    })

    if (!attributeValue) {
        throw new MedusaError(MedusaErrorTypes.NOT_FOUND, `Attribute value with id '${attributeId}' was not found`)
    }

    return res.status(200).json({ attributeValue })
}