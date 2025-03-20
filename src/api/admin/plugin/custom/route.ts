import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import attributeProductCategory from "../../../../links/attribute-product-category";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const test = await query.graph({
        entity: attributeProductCategory.entryPoint,
        fields: ['*'],
        filters: {
            attribute_id: 'attr_01JPRGS3PXMJ34J6KBZGP12HB0'
        }
    })

    return res.json({ res: 'res' })
}