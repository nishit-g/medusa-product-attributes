import AttributeModule from '../modules/attribute'
import ProductModule from "@medusajs/medusa/product";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
    {
        linkable: AttributeModule.linkable.attributeSet,
        isList: true
    },
    {
        linkable: ProductModule.linkable.productCategory,
        isList: true
    }
) 