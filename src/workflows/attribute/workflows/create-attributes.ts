import { createWorkflow, transform, when, WorkflowData, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { CreateAttributesWorkflowInput } from "../../../modules/attribute/types/attribute/common";
import { createAttributesStep } from "../steps/create-attributes";
import { ATTRIBUTE_MODULE } from "../../../modules/attribute";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { createRemoteLinkStep, emitEventStep } from "@medusajs/medusa/core-flows";
import { AttributeWorkflowsEvents } from "../../../modules/attribute/events";

export const createAttributesWorkflowId = 'create-attributes'

export const createAttributesWorkflow = createWorkflow(
    createAttributesWorkflowId,
    (input: WorkflowData<CreateAttributesWorkflowInput>) => {
        const attributesWithoutExternalRelations = transform(input, ({ attributes }) => {
            return attributes.map(attribute => {
                const { product_category_ids, ...result } = attribute
                return result 
            })
        })

        const createdAttributes = createAttributesStep(attributesWithoutExternalRelations)

        const productCategoryLinks: LinkDefinition[] = transform({ input, createdAttributes }, ({ input, createdAttributes }) => {
            return createdAttributes.map((attribute, idx) => {
                const inputAttribute = input.attributes[idx]
                return inputAttribute.product_category_ids?.map(productCategoryId => ({
                    [ATTRIBUTE_MODULE]: {
                        attribute_id: attribute.id
                    },
                    [Modules.PRODUCT]: {
                        product_category_id: productCategoryId
                    }
                })) || []
            }).flat()
        })

        when({ productCategoryLinks }, ({ productCategoryLinks }) => {
            return productCategoryLinks.length > 0
        }).then(() => {
            createRemoteLinkStep(productCategoryLinks)
        })


        const attributeEventData = transform({ createdAttributes }, ({ createdAttributes }) => {
            return createdAttributes.map(attribute => attribute.id)
        }) as string[]

        emitEventStep({
            eventName: AttributeWorkflowsEvents.CREATED,
            data: attributeEventData
        })

        return new WorkflowResponse(createdAttributes)
    } 
)