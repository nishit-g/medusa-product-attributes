import {
  LinkDefinition,
  MedusaContainer,
  ProductDTO,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  arrayDifference,
  MedusaError,
  MedusaErrorTypes,
  Modules,
} from "@medusajs/framework/utils";
import attributeProductCategory from "../links/attribute-product-category";
import { ATTRIBUTE_MODULE } from "../modules/attribute";
import AttributeModuleService from "../modules/attribute/service";

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

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const attributeModuleService =
    container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE);

  const existentAttributeValues =
    await attributeModuleService.listAttributeValues({
      id: attributeValueIds,
    });

  const inexistentAttributeValues = arrayDifference(
    attributeValueIds,
    existentAttributeValues.map((val) => val.id)
  );
  if (inexistentAttributeValues.length) {
    throw new MedusaError(
      MedusaErrorTypes.NOT_FOUND,
      `Attribute values with the following ids were not found:\n${inexistentAttributeValues.join(
        ", "
      )}`
    );
  }

  const productCategoryIds = products
    .filter((prod) => prod.categories)
    .flatMap((prod) => prod.categories!.map((cat) => cat.id));
  const attributeCategoriesMap = new Map<string, string[]>();
  // attributes linked to product categories
  const { data: attributeCategory } = await query.graph({
    entity: attributeProductCategory.entryPoint,
    fields: ["product_category_id", "attribute_id"],
    filters: {
      attribute_id: existentAttributeValues.map(
        (attrVal) => attrVal.attribute_id
      ),
    },
  });

  attributeCategory.map((attrCat) => {
    const attributeId = attrCat.attribute_id;
    const currentCategories = attributeCategoriesMap.get(attributeId) ?? [];

    attributeCategoriesMap.set(
      attributeId,
      currentCategories.concat(attrCat.product_category_id)
    );
  });

  const invalidCategoryConstrainedValues: string[] = [];
  for (const attributeValue of existentAttributeValues) {
    const attributeCategories = attributeCategoriesMap.get(
      attributeValue.attribute_id
    );
    if (!attributeCategories) {
      continue;
    }

    if (
      productCategoryIds.some((prodCat) =>
        attributeCategories.includes(prodCat)
      )
    ) {
      continue;
    }

    invalidCategoryConstrainedValues.push(attributeValue.id);
  }
  if (invalidCategoryConstrainedValues.length) {
    throw new MedusaError(
      MedusaErrorTypes.INVALID_DATA,
      `At least one of the products is not linked to one of the categories required for values:\n${invalidCategoryConstrainedValues.join(
        ", "
      )}`
    );
  }

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
