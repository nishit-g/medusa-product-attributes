import {
  LinkDefinition,
  MedusaContainer,
  ProductDTO,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { ATTRIBUTE_MODULE } from "../modules/attribute";
import { validateAttributeValuesToLink } from "./validate-attribute-values-to-link";

export const productsCreatedHookHandler = async ({
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

  if (!attributeValueIds.length) {
    return [];
  }

  await validateAttributeValuesToLink({
    products,
    attributeValueIds,
    container,
  })

  const link = container.resolve(ContainerRegistrationKeys.LINK);

  // Since the workflow with additional data is called from POST products endpoint,
  // this will always link the series of attributes with only one product
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
