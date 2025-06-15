import {
  ContainerRegistrationKeys,
  MedusaError,
  MedusaErrorTypes,
} from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";

import { CreateProductAttributeValueDTO } from "../../../modules/attribute/types";
import attributeValueProduct from "../../../links/attribute-value-product";
import { ATTRIBUTE_MODULE } from "../../../modules/attribute";
import AttributeModuleService from "../../../modules/attribute/service";

export const validateAttributeValueStepId = "validate-attribute-value";

export const validateAttributeValueStep = createStep(
  validateAttributeValueStepId,
  async (input: CreateProductAttributeValueDTO, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const attributeModuleService = container.resolve<AttributeModuleService>(ATTRIBUTE_MODULE);

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

    // Simplified duplicate check - get all links for this product first
    const { data: productLinks } = await query.graph({
      entity: attributeValueProduct.entryPoint,
      fields: ["attribute_value_id"],
      filters: {
        product_id: input.product_id,
      },
    });

    // If product has any attribute value links, check them
    if (productLinks.length > 0) {
      const linkedAttributeValueIds = productLinks.map(link => link.attribute_value_id);

      // Get the actual attribute values to check for duplicates
      const linkedAttributeValues = await attributeModuleService.listAttributeValues({
        id: linkedAttributeValueIds
      });

      // Check if any existing values match this attribute + value combo
      const duplicateValue = linkedAttributeValues.find(av =>
        av.attribute_id === input.attribute_id && av.value === input.value
      );

      if (duplicateValue) {
        throw new MedusaError(
          MedusaErrorTypes.DUPLICATE_ERROR,
          `Attribute value '${input.value}' for attribute '${attribute.name}' already exists for this product`
        );
      }
    }

    return new StepResponse();
  }
);
