import { MedusaRequest, MedusaResponse, refetchEntity } from "@medusajs/framework";

import { AdminCreateAttributeSetType } from "./validators";
import { createAttributeSetWorkflow } from "../../../../workflows/attribute-set/workflows/create-attribute-set";

export const POST = async (req: MedusaRequest<AdminCreateAttributeSetType>, res: MedusaResponse) => {
    const { result: [attributeSet] } = await createAttributeSetWorkflow(req.scope).run({
        input: [req.validatedBody]
    })

    const response = await refetchEntity(
        'attribute_set',
        attributeSet.id,
        req.scope,
        req.queryConfig.fields,
    )
    
    return res.status(201).json({ attribute_set: response })
}