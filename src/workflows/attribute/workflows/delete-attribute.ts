import {
  createWorkflow,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk";
import { deleteAttributeStep } from "../steps/delete-attribute";
import { emitEventStep } from "@medusajs/medusa/core-flows";

const deleteAttributeWorkflowId = "delete-attribute";

export type DeleteAttributeWorkflowInput = string[]

export const deleteAttributeWorkflow = createWorkflow(
  deleteAttributeWorkflowId,
  (input: DeleteAttributeWorkflowInput) => {
    const deletedAttributes = deleteAttributeStep(input);

    // Emit deletion event
    emitEventStep({
      eventName: "attribute.deleted",
      data: { deletedIds: input, count: input.length }
    });

    return new WorkflowResponse(deletedAttributes);
  }
);
