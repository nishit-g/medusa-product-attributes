import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAttributeValueWorkflow } from "../../../../../workflows/attribute-value/workflow"

interface CreateProductAttributeBody {
  attribute_id: string
  value: string
}

export const POST = async (
  req: MedusaRequest<CreateProductAttributeBody>,
  res: MedusaResponse
) => {
  const productId = req.params.id
  const { attribute_id, value } = req.validatedBody

  try {
    const { result } = await createAttributeValueWorkflow(req.scope).run({
      input: {
        attribute_id,
        value,
        product_id: productId,
      }
    })

    return res.status(201).json({
      attribute_value: result,
      message: "Attribute successfully assigned to product"
    })
  } catch (error) {
    console.error('Error creating product attribute:', error)
    return res.status(400).json({
      error: "Failed to assign attribute to product",
      details: error.message
    })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const productId = req.params.id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // Query attribute values linked to this product
    const { data: productAttributeValues } = await query.graph({
      entity: "attribute_value",
      fields: [
        "id",
        "value",
        "*attribute",
        "*attribute.possible_values"
      ],
      filters: {
        product_link: {
          product_id: productId
        }
      }
    })

    const formattedAttributeValues = productAttributeValues.map(attributeValue => ({
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
    }))

    return res.status(200).json({
      product_id: productId,
      attribute_values: formattedAttributeValues,
      count: formattedAttributeValues.length
    })
  } catch (error) {
    console.error('Error fetching product attributes:', error)
    return res.status(500).json({
      error: "Failed to fetch product attributes",
      details: error.message
    })
  }
}
