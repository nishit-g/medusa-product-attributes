import { WorkflowResponse, createWorkflow, transform } from "@medusajs/framework/workflows-sdk"

import { CreateAttributeSetDTO } from "../../../modules/attribute/types"
import { createAttributeSetStep } from "../steps"

export const createAttributeSetWorkflowId = 'create-attribute-set'

export type CreateAttributeSetWorkflowInput = CreateAttributeSetDTO[]

export const createAttributeSetWorkflow = createWorkflow(
    createAttributeSetWorkflowId,
    (input: CreateAttributeSetWorkflowInput) => {
        const created = createAttributeSetStep(input)

        return new WorkflowResponse(created)
    }
)