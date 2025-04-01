import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import { productsUpdatedHookHandler } from "../../utils/products-updated-handler";

updateProductsWorkflow.hooks.productsUpdated(
    async ({ products, additional_data }, { container }) => {
        await productsUpdatedHookHandler({ products, additional_data, container})
    }
)