import { WorkflowResponse, createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { createAttributeValueStep, validateAttributeValueStep } from "../steps"

import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import { CreateProductAttributeValueDTO } from "../../../modules/attribute/types"
import { Modules } from "@medusajs/framework/utils"
import { createRemoteLinkStep, } from "@medusajs/medusa/core-flows"

export const createAttributeValueWorkflowId = 'create-attribute-value'

export const createAttributeValueWorkflow = createWorkflow(
    createAttributeValueWorkflowId,
    (input: CreateProductAttributeValueDTO) => {
        const attributeValueWithoutExternalRelations = transform({ input }, ({ input }) => {
            const { product_id, ...attributeValue } = input
            return attributeValue
        })
 
        validateAttributeValueStep(input)
        
        const attributeValue = createAttributeValueStep(attributeValueWithoutExternalRelations)

        const link = transform({ input, attributeValue }, ({ input, attributeValue }) => ([{
            [ATTRIBUTE_MODULE]: {
                attribute_value_id: attributeValue.id,
            },
            [Modules.PRODUCT]: {
                product_id: input.product_id
            }
        }]))
        
        createRemoteLinkStep(link)
        
        return new WorkflowResponse(attributeValue)
    }
)