import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

import { AdminGetAttributeValueParamsType } from "../../../validators";

export const GET = async (req: MedusaRequest<AdminGetAttributeValueParamsType>, res: MedusaResponse) => {
    const attributeId = req.params.valueId
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: [attributePossibleValue] } = await query.graph({
        entity: 'attribute_possible_value',
        ...req.queryConfig,
        filters: {
            ...req.filterableFields,
            id: attributeId
        }
    })

    if (!attributePossibleValue) {
        throw new MedusaError(MedusaErrorTypes.NOT_FOUND, `Attribute possible value with id '${attributeId}' was not found`)
    }

    return res.status(200).json({ attributePossibleValue })
}