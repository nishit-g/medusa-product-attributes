// src/workflows/attribute/steps/update-attributes.ts
import { StepResponse, WorkflowData, createStep } from "@medusajs/framework/workflows-sdk"

import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import AttributeModuleService from "../../../modules/attribute/service"
import { UpdateAttributeDTO } from "../../../types/attribute"

const updateAttributesStepId = 'update-attributes'

// Create a type that excludes product_category_ids since it's handled via links
type AttributeUpdateData = Omit<UpdateAttributeDTO, 'product_category_ids'>

export const updateAttributesStep = createStep(
    updateAttributesStepId,
    async (data: WorkflowData<AttributeUpdateData[]>, { container }) => {
        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)

        const prevData = await service.listAttributes({
            id: data.map(attribute => attribute.id)
        })

        // Normalize the data for the service method
        const normalized = data.map(attr => {
            const { possible_values: values, ...attribute } = attr;
            const valuesWithAttribute = values?.map(val => ({ ...val, attribute_id: attribute.id }))
            return {
                ...attr,
                possible_values: valuesWithAttribute
            }
        })

        // Update attributes using the service method
        await service.updateAttributeWithUpsertOrReplacePossibleValues(normalized)

        return new StepResponse(data, prevData)
    },
    async (prevData, { container }) => {
        if (!prevData?.length) {
            return
        }

        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)

        // Convert back to the format expected by the service
        const rollbackData = prevData.map(attr => {
            const { possible_values, ...attributeData } = attr;
            const valuesWithAttribute = possible_values?.map(val => ({
                ...val,
                attribute_id: attr.id
            }))
            return {
                ...attributeData,
                possible_values: valuesWithAttribute
            }
        }) as Omit<UpdateAttributeDTO, 'product_category_ids'>[]

        await service.updateAttributeWithUpsertOrReplacePossibleValues(rollbackData)
    }
)
