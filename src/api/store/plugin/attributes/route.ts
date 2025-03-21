import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StoreGetAttributesParamsType } from "./validators";

export const GET = async (req: MedusaRequest<StoreGetAttributesParamsType>, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: attributes, metadata } = await query.graph({
        entity: 'attribute',
        ...req.queryConfig,
        filters: req.filterableFields,
    })
    return res.status(200).json({ attributes, count: metadata?.count, limit: metadata?.take, offset: metadata?.skip })
}