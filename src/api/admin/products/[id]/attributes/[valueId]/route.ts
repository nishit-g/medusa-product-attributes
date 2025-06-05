import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { deleteAttributeValueWorkflow } from "../../../../../../workflows/attribute-value/workflow"
import { ContainerRegistrationKeys, MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils"

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: productId, valueId } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // First, verify the attribute value exists and is linked to this product
    const { data: attributeValueLinks } = await query.graph({
      entity: "attribute_value",
      fields: ["id", "value"],
      filters: {
        id: valueId,
        product_link: {
          product_id: productId
        }
      }
    })

    if (!attributeValueLinks.length) {
      throw new MedusaError(
        MedusaErrorTypes.NOT_FOUND,
        `Attribute value ${valueId} not found for product ${productId}`
      )
    }

    // Delete the attribute value and its links
    await deleteAttributeValueWorkflow(req.scope).run({
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
    const { data: [attributeValue] } = await query.graph({
      entity: "attribute_value",
      fields: [
        "id",
        "value",
        "*attribute",
        "*attribute.possible_values"
      ],
      filters: {
        id: valueId,
        product_link: {
          product_id: productId
        }
      }
    })

    if (!attributeValue) {
      throw new MedusaError(
        MedusaErrorTypes.NOT_FOUND,
        `Attribute value ${valueId} not found for product ${productId}`
      )
    }

    const formattedAttributeValue = {
      id: attributeValue.id,
      value: attributeValue.value,
      attribute: {
        id: attributeValue.attribute.id,
        name: attributeValue.attribute.name,
        description: attributeValue.attribute.description,
        handle: attributeValue.attribute.handle,
        is_variant_defining: attributeValue.attribute.is_variant_defining,
        is_filterable: attributeValue.attribute.is_filterable,
        possible_values: attributeValue.attribute.possible_values || []
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
