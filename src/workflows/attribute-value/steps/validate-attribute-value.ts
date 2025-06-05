import {
  ContainerRegistrationKeys,
  MedusaError,
  MedusaErrorTypes,
} from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";

import { CreateProductAttributeValueDTO } from "../../../modules/attribute/types";
import attributeValueProduct from "../../../links/attribute-value-product";

export const validateAttributeValueStepId = "validate-attribute-value";

export const validateAttributeValueStep = createStep(
  validateAttributeValueStepId,
  async (input: CreateProductAttributeValueDTO, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    // Validate attribute exists and get its constraints
    const {
      data: [attribute],
    } = await query.graph({
      entity: "attribute",
      fields: ["id", "name", "product_categories.id", "possible_values.value"],
      filters: {
        id: input.attribute_id,
      },
    });

    if (!attribute) {
      throw new MedusaError(
        MedusaErrorTypes.NOT_FOUND,
        `Attribute ${input.attribute_id} not found`
      );
    }

    // Check if value is allowed (if possible values are defined)
    const allowedValues = attribute.possible_values?.map(
      (posVal) => posVal.value
    );

    if (allowedValues?.length && !allowedValues.includes(input.value)) {
      throw new MedusaError(
        MedusaErrorTypes.INVALID_DATA,
        `Attribute ${attribute.name} doesn't define '${input.value}' as a possible value. Allowed values: ${allowedValues.join(', ')}`
      );
    }

    const attributeCategoryIds = attribute.product_categories?.map(
      (cat) => cat.id
    ) || [];

    // Validate product-category constraints (if attribute has category restrictions)
    if (attributeCategoryIds.length > 0) {
      const {
        data: [product],
      } = await query.graph({
        entity: "product",
        fields: ["id", "categories.id"],
        filters: {
          id: input.product_id,
        },
      });

      if (!product) {
        throw new MedusaError(
          MedusaErrorTypes.NOT_FOUND,
          `Product ${input.product_id} not found`
        );
      }

      const productCategoryIds = product.categories?.map((cat) => cat.id) || [];

      if (
        !productCategoryIds.some((prodCatId) =>
          attributeCategoryIds.includes(prodCatId)
        )
      ) {
        throw new MedusaError(
          MedusaErrorTypes.INVALID_DATA,
          `Product ${input.product_id} must be in one of the categories that this attribute is restricted to.`
        );
      }
    }

    // Check for duplicate attribute values on the same product using the link entity
    // Filter using attribute_value.attribute_id directly to avoid joining the attribute table
    const { data: existingLinks } = await query.graph({
      entity: attributeValueProduct.entryPoint,
      fields: [
        "attribute_value.id",
        "attribute_value.value",
      ],
      filters: {
        product_id: input.product_id,
        "attribute_value.attribute_id": input.attribute_id,
        "attribute_value.value": input.value,
      },
    });

    if (existingLinks.length > 0) {
      throw new MedusaError(
        MedusaErrorTypes.DUPLICATE_ERROR,
        `Attribute value '${input.value}' for attribute '${attribute.name}' already exists for this product`
      );
    }

    return new StepResponse();
  }
);
