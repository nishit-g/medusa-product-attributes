// src/api/admin/plugin/attributes/[id]/route.ts
import { MedusaRequest, MedusaResponse, refetchEntity } from "@medusajs/framework";
import { AdminGetAttributeParamsType, AdminUpdateAttributeType } from "../validators";
import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
import { updateAttributesWorkflow } from "../../../../../workflows";
import { deleteAttributeWorkflow } from "../../../../../workflows/attribute/workflows/delete-attribute";

export const POST = async (req: MedusaRequest<AdminUpdateAttributeType>, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const attributeId = req.params.id

    const { data: [existingAttribute] } = await query.graph({
        entity: 'attribute',
        fields: ['id'],
        filters: {
            id: attributeId
        }
    })

    if (!existingAttribute) {
        throw new MedusaError(MedusaErrorTypes.NOT_FOUND, `Attribute with id '${attributeId}' not found`)
    }

    // The workflow now properly handles product_category_ids via links
    await updateAttributesWorkflow(req.scope).run({
        input: { attributes: [{
            ...req.validatedBody,
            id: attributeId
        }] }
    })

    // Refetch the updated attribute with its linked categories
    const attribute = await refetchEntity(
        'attribute',
        attributeId,
        req.scope,
        req.queryConfig.fields
    )

    return res.status(200).json({ attribute })
}

export const GET = async (req: MedusaRequest<AdminGetAttributeParamsType>, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const attributeId = req.params.id

    const { data: [attribute] } = await query.graph({
        entity: 'attribute',
        ...req.queryConfig,
        filters: {
            id: attributeId,
        },
    })

    if (!attribute) {
        throw new MedusaError(MedusaErrorTypes.NOT_FOUND, 'Attribute not found')
    }

    return res.status(200).json({ attribute })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const attributeId = req.params.id
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Check if attribute exists
    const { data: [existingAttribute] } = await query.graph({
        entity: 'attribute',
        fields: ['id'],
        filters: {
            id: attributeId
        }
    })

    if (!existingAttribute) {
        throw new MedusaError(MedusaErrorTypes.NOT_FOUND, `Attribute with id '${attributeId}' not found`)
    }

    // Delete the attribute using workflow
    await deleteAttributeWorkflow(req.scope).run({
        input: [attributeId]
    })

    return res.status(200).json({
        message: "Attribute deleted successfully",
        deleted: true,
        id: attributeId
    })
}
