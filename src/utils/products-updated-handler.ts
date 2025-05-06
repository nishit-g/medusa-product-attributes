import { createAttributeValueWorkflow, deleteAttributeValueWorkflow } from "../workflows/attribute-value/workflow";

import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaContainer } from "@medusajs/framework";
import { ProductAttributeValueDTO } from "../types/attribute";
import { ProductDTO } from "@medusajs/framework/types";
import { validateAttributeValuesToLink } from "./validate-attribute-values-to-link";

export const productsUpdatedHookHandler = async ({
  products,
  additional_data,
  container,
}: {
  products: ProductDTO[];
  additional_data: Record<string, unknown> | undefined;
  container: MedusaContainer;
}) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  const attributeValues = (additional_data?.values ?? []) as ProductAttributeValueDTO[];
  const productIds = products.map((prod) => prod.id);

  if (!attributeValues.length) {
    return [];
  }

  const updated = await Promise.all(productIds.flatMap(prodId => attributeValues.map(async attrVal => {
    const { result } = await createAttributeValueWorkflow(container).run({
      input: {
        attribute_id: attrVal.attribute_id,
        value: attrVal.value,
        product_id: prodId,
      }
    })
    return result
  })))

  const newValueIds = updated.map(val => val.id)

  const { data } = await query.graph({
    entity: 'attribute_value',
    fields: ['id'],
    filters: {
      id: {
        $ne: newValueIds
      }
    }
  })

  if (!data.length) {
    return;
  }
  
  await deleteAttributeValueWorkflow(container).run({
    input: data.map(val => val.id)
  })
}; 
