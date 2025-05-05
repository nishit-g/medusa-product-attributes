import { WorkflowResponse, createWorkflow, transform } from "@medusajs/framework/workflows-sdk"

import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import { CreateAttributeSetDTO } from "../../../modules/attribute/types"
import { Modules } from "@medusajs/framework/utils"
import { createAttributeSetStep } from "../steps"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"

export const createAttributeSetWorkflowId = 'create-attribute-set'

export type CreateAttributeSetWorkflowInput = CreateAttributeSetDTO[]

export const createAttributeSetWorkflow = createWorkflow(
    createAttributeSetWorkflowId,
    (input: CreateAttributeSetWorkflowInput) => {
        const attributeSetsWithoutExternalRelations = transform({ input }, ({ input }) => 
            input.map(attributeSet => {
                const { categories, ...rest } = attributeSet
                return rest
            })
        )

        const created = createAttributeSetStep(attributeSetsWithoutExternalRelations)

        const links = transform({ input, created }, ({ input, created }) => 
            created.flatMap((created, indx) => 
                input[indx].categories?.map(categoryId => ({
                    [ATTRIBUTE_MODULE]: {
                        attribute_set_id: created.id
                    },
                    [Modules.PRODUCT]: {
                        product_category_id: categoryId
                    }
                })) ?? []
            )
        )

        createRemoteLinkStep(links)

        return new WorkflowResponse(created)
    }
)