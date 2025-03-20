import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CreateAttributeValueDTO } from "../../../types/attribute"
import { createAttributeValuesStep } from "../steps/create-attribute-values"

const createAttributeValuesWorkflowId = 'create-attribute-values'

export type CreateAttributeValuesWorkflowInput = CreateAttributeValueDTO[]

export const createAttributeValuesWorkflow = createWorkflow(
    createAttributeValuesWorkflowId,
    (input: CreateAttributeValuesWorkflowInput) => {
        const createdValues = createAttributeValuesStep(input)

        return new WorkflowResponse(createdValues)
    }
)
