import { createStep, StepResponse, WorkflowData } from "@medusajs/framework/workflows-sdk"
import { UpdateAttributeDTO } from "../../../modules/attribute/types/attribute/common"
import AttributeModuleService from "../../../modules/attribute/service"
import { ATTRIBUTE_MODULE } from "../../../modules/attribute"

const updateAttributesStepId = 'update-attributes'

export const updateAttributesStep = createStep(
    updateAttributesStepId,
    async (data: WorkflowData<UpdateAttributeDTO[]>, { container }) => {
        const service = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE)

        const prevData = await service.listAttributes({
            id: data.map(attribute => attribute.id)
        })

        // TODO: correct type when AttributeDTO is created
        const attributes = await service.updateAttributes(data) as any[]

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