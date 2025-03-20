import { defineLink } from "@medusajs/framework/utils"
import AttributeModule from '../modules/attribute'
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
    {
        linkable: AttributeModule.linkable.attributeValue,
        isList: true,
    },
    {
        linkable: ProductModule.linkable.product,
        isList: true,
    }
)