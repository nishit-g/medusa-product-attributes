import { createStep, StepResponse, WorkflowData } from "@medusajs/framework/workflows-sdk"
import AttributeModuleService from "../../../modules/attribute/service"
import { ATTRIBUTE_MODULE } from "../../../modules/attribute"
import { UpdateAttributeDTO } from "../../../types/attribute"

const updateAttributesStepId = 'update-attributes'

export const updateAttributesStep = createStep(
    updateAttributesStepId,
    async (data: WorkflowData<UpdateAttributeDTO[]>, { container }) => {
        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)

        const prevData = await service.listAttributes({
            id: data.map(attribute => attribute.id)
        })

        const normalized = data.map(attr => {
            const { values, ...attribute } = attr;
            return {
                attribute,
                values
            }
        })

        const attributes = normalized.map(({ attribute }) => attribute)

        await service.updateAttributes(attributes)
        await service.upsertAttributeValues(data)

        return new StepResponse(attributes, prevData)
    },
    async (prevData, { container }) => {
        if (!prevData?.length) {
            return
        }

        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)
        //@ts-expect-error
        await service.updateAttributes(prevData)
    }
)