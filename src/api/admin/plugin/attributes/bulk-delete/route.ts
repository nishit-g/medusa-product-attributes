// src/api/admin/plugin/attributes/bulk-delete/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
import { deleteAttributeWorkflow } from "../../../../../workflows/attribute/workflows/delete-attribute";
import { z } from "zod";

const BulkDeleteAttributesSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one attribute ID is required")
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { ids } = BulkDeleteAttributesSchema.parse(req.body);
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Verify all attributes exist
    const { data: existingAttributes } = await query.graph({
        entity: 'attribute',
        fields: ['id'],
        filters: {
            id: ids
        }
    });

    const existingIds = existingAttributes.map(attr => attr.id);
    const notFoundIds = ids.filter(id => !existingIds.includes(id));

    if (notFoundIds.length > 0) {
        throw new MedusaError(
            MedusaErrorTypes.NOT_FOUND,
            `Attributes not found: ${notFoundIds.join(', ')}`
        );
    }

    // Delete all attributes using workflow
    await deleteAttributeWorkflow(req.scope).run({
        input: ids
    });

    return res.status(200).json({
        message: `${ids.length} attributes deleted successfully`,
        deleted: true,
        ids: ids,
        count: ids.length
    });
};
