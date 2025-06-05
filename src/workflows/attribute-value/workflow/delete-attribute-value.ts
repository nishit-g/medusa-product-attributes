import { WorkflowResponse, createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"

import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import { Modules } from "@medusajs/framework/utils"
import attributeValueProduct from "../../../links/attribute-value-product"
import { deleteAttributeValueStep } from "../steps"

export const deleteAttributeValueWorkflowId = 'delete-attribute-value'

export type DeleteAttributeValueWorkflowInput = string | string[]

export const deleteAttributeValueWorkflow = createWorkflow(
    deleteAttributeValueWorkflowId,
    (input: DeleteAttributeValueWorkflowInput) => {
        const normalizedInput = transform({ input }, ({ input }) =>
            Array.isArray(input) ? input : [input]
        )

        // Query current product links before deletion using the link entity
        const attributeValueProductQuery = useQueryGraphStep({
            entity: attributeValueProduct.entryPoint,
            fields: ["attribute_value_id", "product_id"],
            filters: {
                attribute_value_id: normalizedInput
            }
        })

        // Delete the attribute values
        const deleted = deleteAttributeValueStep(normalizedInput)

        // Prepare links to dismiss using the actual link data
        const links = transform({ attributeValueProductQuery }, ({ attributeValueProductQuery }) => {
            const { data } = attributeValueProductQuery;
            return data.map(link => ({
                [ATTRIBUTE_MODULE]: {
                    attribute_value_id: link.attribute_value_id,
                },
                [Modules.PRODUCT]: {
                    product_id: link.product_id
                }
            }))
        })

        // Dismiss the links
        dismissRemoteLinkStep(links)

        return new WorkflowResponse(deleted)
    }
)
