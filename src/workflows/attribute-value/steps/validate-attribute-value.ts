import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

import { CreateProductAttributeValueDTO } from "../../../modules/attribute/types"
import attributeValueProductLink from "../../../links/attribute-value-product"

export const validateAttributeValueStepId = 'validate-attribute-value'

export const validateAttributeValueStep = createStep(
    validateAttributeValueStepId,
    async (input: CreateProductAttributeValueDTO, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        
        const { data: attributeValuesProduct } = await query.graph({
            entity: attributeValueProductLink.entryPoint,
            fields: ['attribute_value.value', 'attribute_value.attribute_id'],
            filters: {
                product_id: input.product_id,
            }
        })

        const attributeValues = attributeValuesProduct.map(element => element.attribute_value)

        if (attributeValues.some(value => value.attribute_id === input.attribute_id && value.value === input.value)) {
            throw new MedusaError(MedusaErrorTypes.DUPLICATE_ERROR, `Attribute value ${input.value} for attribute ${input.attribute_id} already exists for product ${input.product_id}`)
        }

        return new StepResponse()   
    }
)