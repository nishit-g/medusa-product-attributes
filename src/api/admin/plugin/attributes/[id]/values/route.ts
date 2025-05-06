import { AdminCreateAttributeValueType, AdminGetAttributeValuesParamsType } from "../../validators";
import { MedusaRequest, MedusaResponse, refetchEntities, refetchEntity } from "@medusajs/framework";

import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createAttributePossibleValuesWorkflow } from "../../../../../../workflows/attribute/workflows/create-attribute-possible-values";

export const GET = async (req: MedusaRequest<AdminGetAttributeValuesParamsType>, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: attributePossibleValues, metadata } = await query.graph({
        entity: 'attribute_possible_value',
        filters: {
            attribute_id: req.params.id
        },
        ...req.queryConfig
    })

    res.status(200).json({ attributePossibleValues, count: metadata?.count, offset: metadata?.skip, limit: metadata?.take })
}

export const POST = async (req: MedusaRequest<AdminCreateAttributeValueType>, res: MedusaResponse) => {
    const attributeId = req.params.id

    const { result: [createdAttributeValue] } = await createAttributePossibleValuesWorkflow(req.scope).run({
        input: [{
            ...req.validatedBody,
            attribute_id: attributeId
        }]
    })

    const attributePossibleValue = await refetchEntity(
        'attribute_possible_value',
        createdAttributeValue.id,
        req.scope,
        req.queryConfig.fields,
    )

    return res.status(201).json({ attributePossibleValue })
}