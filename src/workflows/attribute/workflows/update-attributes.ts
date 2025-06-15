// src/workflows/attribute/workflows/update-attributes.ts
import {
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { UpdateAttributeDTO } from "../../../modules/attribute/types/attribute/common";
import { updateAttributesStep } from "../steps";
import { LinkDefinition } from "@medusajs/framework/types";
import { ATTRIBUTE_MODULE } from "../../../modules/attribute";
import { Modules } from "@medusajs/framework/utils";
import { createRemoteLinkStep, dismissRemoteLinkStep, emitEventStep, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import attributeProductCategory from "../../../links/attribute-product-category";
import { AttributeWorkflowsEvents } from "../../../modules/attribute/events";

const updateAttributesWorkflowId = "update-attributes";

export type UpdateAttributesWorkflowInput = {
  attributes: UpdateAttributeDTO[];
};

export const updateAttributesWorkflow = createWorkflow(
  updateAttributesWorkflowId,
  (input: UpdateAttributesWorkflowInput) => {
    // Remove product_category_ids from the attribute update data
    // since it's not a direct field on the attribute table
    const attributesWithoutCategoryIds = transform({ input }, ({ input: { attributes } }) => {
      return attributes.map((attribute) => {
        const { product_category_ids, ...attributeData } = attribute;
        return attributeData;
      });
    });

    // Update the attributes (without category relationships)
    const updatedAttributes = updateAttributesStep(attributesWithoutCategoryIds);

    // Get attributes that have category updates (including empty arrays to clear categories)
    const attributesWithCategoryUpdates = transform({ input }, ({ input: { attributes } }) => {
      return attributes.filter(attr => attr.product_category_ids !== undefined);
    });

    const attributeIdsWithCategoryUpdates = transform({ attributesWithCategoryUpdates }, ({ attributesWithCategoryUpdates }) => {
      return attributesWithCategoryUpdates.map(attr => attr.id);
    });

    // Get current category links for attributes that have category updates
    const currentCategoryLinksResult = useQueryGraphStep({
      entity: attributeProductCategory.entryPoint,
      fields: ["attribute_id", "product_category_id"],
      filters: {
        attribute_id: attributeIdsWithCategoryUpdates,
      },
    });

    const currentCategoryLinks = transform({ currentCategoryLinksResult }, ({ currentCategoryLinksResult }) => {
      return currentCategoryLinksResult.data;
    });

    // Prepare links to delete (all current links for attributes being updated)
    const linksToDelete = transform({ currentCategoryLinks }, ({ currentCategoryLinks }) => {
      if (!currentCategoryLinks.length) {
        return [];
      }

      return currentCategoryLinks.map(({ attribute_id, product_category_id }) => ({
        [ATTRIBUTE_MODULE]: {
          attribute_id
        },
        [Modules.PRODUCT]: {
          product_category_id
        }
      }));
    });

    // Prepare new links to create (only for non-empty category arrays)
    const linksToCreate: LinkDefinition[] = transform(
      { attributesWithCategoryUpdates },
      ({ attributesWithCategoryUpdates }) => {
        return attributesWithCategoryUpdates
          .filter((attribute) => attribute.product_category_ids && attribute.product_category_ids.length > 0)
          .flatMap((attribute) =>
            attribute.product_category_ids!.map((categoryId) => ({
              [ATTRIBUTE_MODULE]: {
                attribute_id: attribute.id,
              },
              [Modules.PRODUCT]: {
                product_category_id: categoryId,
              },
            }))
          );
      }
    );

    const updatedAttributesEventData = transform({ updatedAttributes }, ({ updatedAttributes }) =>
      updatedAttributes.map(attr => attr.id)
    );

    // Handle link operations conditionally
    when({ linksToDelete }, ({ linksToDelete }) => {
      return linksToDelete.length > 0;
    }).then(() => {
      dismissRemoteLinkStep(linksToDelete);
    });

    when({ linksToCreate }, ({ linksToCreate }) => {
      return linksToCreate.length > 0;
    }).then(() => {
      createRemoteLinkStep(linksToCreate);
    });

    // Emit event
    emitEventStep({
      eventName: AttributeWorkflowsEvents.UPDATED,
      data: updatedAttributesEventData
    });

    return new WorkflowResponse(updatedAttributes);
  }
);
