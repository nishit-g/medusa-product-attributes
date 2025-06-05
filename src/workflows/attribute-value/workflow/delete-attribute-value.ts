import { WorkflowResponse, createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"

import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import { Modules } from "@medusajs/framework/utils"
import { deleteAttributeValueStep } from "../steps"

export const deleteAttributeValueWorkflowId = 'delete-attribute-value'

export type DeleteAttributeValueWorkflowInput = string | string[]

export const deleteAttributeValueWorkflow = createWorkflow(
    deleteAttributeValueWorkflowId,
    (input: DeleteAttributeValueWorkflowInput) => {
        const normalizedInput = transform({ input }, ({ input }) =>
            Array.isArray(input) ? input : [input]
        )

        // Query current product links before deletion
        const attributeValueProductQuery = useQueryGraphStep({
            entity: "attribute_value",
            fields: ["id", "product_link.product_id"],
            filters: {
                id: normalizedInput
            }
        })

        // Delete the attribute values
        const deleted = deleteAttributeValueStep(normalizedInput)

        // Prepare links to dismiss
        const links = transform({ attributeValueProductQuery }, ({ attributeValueProductQuery }) => {
            const { data } = attributeValueProductQuery;
            return data.flatMap(attributeValue =>
                (attributeValue.product_link || []).map(link => ({
                    [ATTRIBUTE_MODULE]: {
                        attribute_value_id: attributeValue.id,
                    },
                    [Modules.PRODUCT]: {
                        product_id: link.product_id
                    }
                }))
            )
        })

        // Dismiss the links
        dismissRemoteLinkStep(links)

        return new WorkflowResponse(deleted)
    }
)
