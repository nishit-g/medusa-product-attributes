import { MedusaContainer } from "@medusajs/framework";
import { LinkDefinition, ProductDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { validateAttributeValuesToLink } from "./validate-attribute-values-to-link";
import attributeValueProduct from "../links/attribute-value-product";
import { ATTRIBUTE_MODULE } from "../modules/attribute";

export const productsUpdatedHookHandler = async ({
  products,
  additional_data,
  container,
}: {
  products: ProductDTO[];
  additional_data: Record<string, unknown> | undefined;
  container: MedusaContainer;
}) => {
  const attributeValueIds = (additional_data?.values ?? []) as string[];
  const productIds = products.map((prod) => prod.id);

  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // Refetch so we can make sure categories are included for validation
  const { data: refetchedProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'categories.*'],
    filters: {
        id: productIds,
    }
  })

  if (!attributeValueIds.length) {
    return [];
  }

  const link = container.resolve(ContainerRegistrationKeys.LINK);

  await validateAttributeValuesToLink({
    attributeValueIds,
    products: refetchedProducts,
    container,
  });

  const { data: oldLinkedRecordsToDismiss } = await query.graph({
    entity: attributeValueProduct.entryPoint,
    fields: ['product_id', 'attribute_value_id'],
    filters: {
        product_id: productIds,
        attribute_value_id: {
            $nin: attributeValueIds
        }
    }
  })

  if (oldLinkedRecordsToDismiss.length) {
    const linksToDismiss: LinkDefinition[] = oldLinkedRecordsToDismiss.map(record => ({
        [ATTRIBUTE_MODULE]: {
            attribute_value_id: record.attribute_value_id
        },
        [Modules.PRODUCT]: {
            product_id: record.product_id,
        }
    }))
    await link.dismiss(linksToDismiss);
  }

  const links: LinkDefinition[] = attributeValueIds.flatMap((attrValId) =>
    productIds.map((prodId) => ({
      [ATTRIBUTE_MODULE]: {
        attribute_value_id: attrValId,
      },
      [Modules.PRODUCT]: {
        product_id: prodId,
      },
    }))
  );

  await link.create(links);
  return links;
}; 
