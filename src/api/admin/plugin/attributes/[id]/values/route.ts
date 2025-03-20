import { MedusaRequest, MedusaResponse, refetchEntities } from "@medusajs/framework";
import { AdminCreateAttributeValueType, AdminGetAttributeValuesParamsType } from "../../validators";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createAttributeValuesWorkflow } from "../../../../../../workflows/attribute/workflows/create-attribute-values";

export const GET = async (req: MedusaRequest<AdminGetAttributeValuesParamsType>, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const { data: attributeValues, metadata } = await query.graph({
        entity: 'attribute_value',
        ...req.queryConfig
    })

    res.status(200).json({ attributeValues, count: metadata?.count, offset: metadata?.skip, limit: metadata?.take })
}

export const POST = async (req: MedusaRequest<AdminCreateAttributeValueType>, res: MedusaResponse) => {
    const attributeId = req.params.id

    const { result: [createdAttributeValue] } = await createAttributeValuesWorkflow(req.scope).run({
        input: [{
            ...req.validatedBody,
            attribute_id: attributeId
        }]
    })

    const attributeValue = await refetchEntities(
        'attribute_value',
        // TODO: replace with id
        createdAttributeValue.id,
        req.scope,
        req.queryConfig.fields,
    )

    return res.status(201).json({ attributeValue })
}