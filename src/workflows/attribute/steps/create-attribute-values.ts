import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CreateAttributeValueDTO } from "../../../types/attribute"
import AttributeModuleService from "../../../modules/attribute/service"
import { ATTRIBUTE_MODULE } from "../../../modules/attribute"

export const createAttributeValuesStepId = 'create-attribute-values'

export type CreateAttributeValuesStepInput = CreateAttributeValueDTO[]

export const createAttributeValuesStep = createStep(
    createAttributeValuesStepId,
    async (data: CreateAttributeValuesStepInput, { container }) => {
        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)

        const values = await service.createAttributeValues(data)

        return new StepResponse(values, values.map(val => val.id))
    },
    async (ids, { container }) => {
        if (!ids?.length) {
            return
        }

        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)

        await service.deleteAttributeValues(ids)
    }
)