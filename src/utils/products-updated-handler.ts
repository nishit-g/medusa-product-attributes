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

  // Refetch so we can make sure categories are included for validation
  const { data: refetchedProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'categories.*'],
    filters: {
        id: productIds,
    }
  })

  await validateAttributeValuesToLink({
    products: refetchedProducts,
    attributeValues,
    container,
  })

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

  // const { data: oldLinkedRecordsToDismiss } = await query.graph({
  //   entity: attributeValueProduct.entryPoint,
  //   fields: ['product_id', 'attribute_value_id'],
  //   filters: {
  //       product_id: productIds,
  //       attribute_value_id: {
  //           $nin: attributeValueIds
  //       }
  //   }
  // })

  // if (oldLinkedRecordsToDismiss.length) {
  //   const linksToDismiss: LinkDefinition[] = oldLinkedRecordsToDismiss.map(record => ({
  //       [ATTRIBUTE_MODULE]: {
  //           attribute_value_id: record.attribute_value_id
  //       },
  //       [Modules.PRODUCT]: {
  //           product_id: record.product_id,
  //       }
  //   }))
  //   await link.dismiss(linksToDismiss);
  // }

  // const links: LinkDefinition[] = attributeValueIds.flatMap((attrValId) =>
  //   productIds.map((prodId) => ({
  //     [ATTRIBUTE_MODULE]: {
  //       attribute_value_id: attrValId,
  //     },
  //     [Modules.PRODUCT]: {
  //       product_id: prodId,
  //     },
  //   }))
  // );

  // await link.create(links);
  // return links;
}; 
