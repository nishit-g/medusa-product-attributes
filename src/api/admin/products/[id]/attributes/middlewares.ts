import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "zod"

const CreateProductAttributeSchema = z.object({
  attribute_id: z.string().min(1, "Attribute ID is required"),
  value: z.string().min(1, "Attribute value is required"),
})

export const productAttributesMiddlewares: MiddlewareRoute[] = [
  {
    method: ['POST'],
    matcher: '/admin/products/:id/attributes',
    middlewares: [
      validateAndTransformBody(CreateProductAttributeSchema)
    ]
  }
]
