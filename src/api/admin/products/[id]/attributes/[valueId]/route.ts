import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { deleteAttributeValueWorkflow } from "../../../../../../workflows/attribute-value/workflow"
import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils"

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId, valueId } = req.params

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // Verify the attribute value exists and belongs to this product
    const { data: attributeValueLinks } = await query.graph({
      entity: 'attribute_value_product',
      fields: ['attribute_value_id', 'product_id'],
      filters: {
        attribute_value_id: valueId,
        product_id: productId
      }
    })

    if (!attributeValueLinks.length) {
      throw new MedusaError(
        MedusaErrorTypes.NOT_FOUND,
        `Attribute value ${valueId} not found for product ${productId}`
      )
    }

    // Delete the attribute value and its links
    const { result } = await deleteAttributeValueWorkflow(req.scope).run({
      input: [valueId]
    })


    return res.status(200).json({
      message: "Attribute value removed from product successfully",
      deleted: true,
      id: valueId,
      product_id: productId
    })
  } catch (error) {

    console.error('Error removing attribute from product:', error)


    if (error instanceof MedusaError) {
      return res.status(error.type === 'not_found' ? 404 : 400).json({
        error: error.message
      })
    }


    return res.status(500).json({
      error: "Failed to remove attribute from product",
      details: error.message

    })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId, valueId } = req.params

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: [attributeValueLink] } = await query.graph({
      entity: 'attribute_value_product',
      fields: [
        '*attribute_value',
        '*attribute_value.attribute',

        '*attribute_value.attribute.possible_values'
      ],
      filters: {
        attribute_value_id: valueId,
        product_id: productId

      }
    })

    if (!attributeValueLink) {
      throw new MedusaError(
        MedusaErrorTypes.NOT_FOUND,
        `Attribute value ${valueId} not found for product ${productId}`
      )
    }

    const formattedAttributeValue = {
      id: attributeValueLink.attribute_value.id,

      value: attributeValueLink.attribute_value.value,
      attribute: {
        id: attributeValueLink.attribute_value.attribute.id,
        name: attributeValueLink.attribute_value.attribute.name,
        description: attributeValueLink.attribute_value.attribute.description,
        handle: attributeValueLink.attribute_value.attribute.handle,
        is_variant_defining: attributeValueLink.attribute_value.attribute.is_variant_defining,
        is_filterable: attributeValueLink.attribute_value.attribute.is_filterable,
        possible_values: attributeValueLink.attribute_value.attribute.possible_values || []

      }
    }

    return res.status(200).json({
      product_id: productId,
      attribute_value: formattedAttributeValue
    })
  } catch (error) {
    console.error('Error fetching product attribute:', error)


    if (error instanceof MedusaError) {
      return res.status(error.type === 'not_found' ? 404 : 400).json({
        error: error.message
      })
    }

    return res.status(500).json({

      error: "Failed to fetch product attribute",
      details: error.message
    })
  }
}


