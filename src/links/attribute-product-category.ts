import { defineLink } from "@medusajs/framework/utils";
import AttributeModule from '../modules/attribute'
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
    {
        linkable: AttributeModule.linkable.attribute,
        isList: true
    },
    {
        linkable: ProductModule.linkable.productCategory,
        isList: true
    }
)