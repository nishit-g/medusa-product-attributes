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

        const attributeValueProductQuery = useQueryGraphStep({
            entity: attributeValueProduct.entryPoint,
            fields: ['product_id', 'attribute_value_id'],
            filters: {
                attribute_value_id: normalizedInput
            }
        })

        const deleted = deleteAttributeValueStep(normalizedInput)

        const links = transform({ attributeValueProductQuery }, ({ attributeValueProductQuery }) => {
            const { data } = attributeValueProductQuery;
            return data.map(element => ({
                [ATTRIBUTE_MODULE]: {
                    attribute_value_id: element.attribute_value_id,
                },
                [Modules.PRODUCT]: {
                    product_id: element.product_id
                }
            }))
        })
         
        dismissRemoteLinkStep(links)
        
        return new WorkflowResponse(deleted)
    } 
)