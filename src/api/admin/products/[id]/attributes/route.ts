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
    const { data: productAttributeValues } = await query.graph({
      entity: attributeValueProduct.entryPoint,
      fields: [

        'attribute_value_id',
        '*attribute_value',
        '*attribute_value.attribute',
        '*attribute_value.attribute.possible_values'
      ],
      filters: { product_id: productId }
    })


    const formattedAttributeValues = productAttributeValues.map(pav => ({
      id: pav.attribute_value.id,
      value: pav.attribute_value.value,
      attribute: {
        id: pav.attribute_value.attribute.id,
        name: pav.attribute_value.attribute.name,
        description: pav.attribute_value.attribute.description,
        handle: pav.attribute_value.attribute.handle,
        is_variant_defining: pav.attribute_value.attribute.is_variant_defining,
        is_filterable: pav.attribute_value.attribute.is_filterable,
        possible_values: pav.attribute_value.attribute.possible_values || []
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

