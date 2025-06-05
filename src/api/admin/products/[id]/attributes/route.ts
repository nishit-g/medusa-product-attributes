import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAttributeValueWorkflow } from "../../../../../workflows/attribute-value/workflow"
import attributeValueProduct from "../../../../../links/attribute-value-product"

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
    // Query the link entity to get attribute values for this product
    const { data: productAttributeLinks } = await query.graph({
      entity: attributeValueProduct.entryPoint,
      fields: [
        "attribute_value_id",
        "product_id",
        "attribute_value.id",
        "attribute_value.value",
        "attribute_value.attribute.id",
        "attribute_value.attribute.name",
        "attribute_value.attribute.description",
        "attribute_value.attribute.handle",
        "attribute_value.attribute.is_variant_defining",
        "attribute_value.attribute.is_filterable",
        "attribute_value.attribute.possible_values"
      ],
      filters: {
        product_id: productId
      }
    })

    const formattedAttributeValues = productAttributeLinks.map(link => ({
      id: link.attribute_value.id,
      value: link.attribute_value.value,
      attribute: {
        id: link.attribute_value.attribute.id,
        name: link.attribute_value.attribute.name,
        description: link.attribute_value.attribute.description,
        handle: link.attribute_value.attribute.handle,
        is_variant_defining: link.attribute_value.attribute.is_variant_defining,
        is_filterable: link.attribute_value.attribute.is_filterable,
        possible_values: link.attribute_value.attribute.possible_values || []
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
