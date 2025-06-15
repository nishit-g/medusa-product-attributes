// src/modules/attribute/service.ts
import {
    arrayDifference,
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils";
import Attribute from "./models/attribute";
import { Context, DAL, InferTypeOf } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";
import {
  CreateAttributeValueDTO,
  UpdateAttributeDTO,
  UpsertAttributeValueDTO,
  UpdateAttributeValueDTO,
} from "../../types/attribute";
import AttributeValue from "./models/attribute-value";
import AttributeSet from "./models/attribute-set";
import AttributePossibleValue from "./models/attribute-possible-value";

type Attribute = InferTypeOf<typeof Attribute>
type AttributePossibleValue = InferTypeOf<typeof AttributePossibleValue>

type InjectedDependencies = {
  attributeRepository: DAL.RepositoryService<Attribute>;
  attributePossibleValueRepository: DAL.RepositoryService<AttributePossibleValue>;
};

class AttributeModuleService extends MedusaService({
  Attribute,
  AttributeValue,
  AttributeSet,
  AttributePossibleValue,
}) {
  protected attributeRepository_: DAL.RepositoryService<Attribute>;
  protected attributePossibleValueRepository_: DAL.RepositoryService<AttributePossibleValue>;

  constructor({
    attributeRepository,
    attributePossibleValueRepository,
  }: InjectedDependencies) {
    super(...arguments);
    this.attributeRepository_ = attributeRepository;
    this.attributePossibleValueRepository_ = attributePossibleValueRepository;
  }

  /**
   * Update attribute with upsert or replace possible values
   * This method handles only the core attribute data and possible values
   * Category relationships are handled separately via links
   */
  @InjectManager()
  async updateAttributeWithUpsertOrReplacePossibleValues(
    input: Omit<UpdateAttributeDTO, 'product_category_ids'> | Omit<UpdateAttributeDTO, 'product_category_ids'>[],
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    const normalizedInput = Array.isArray(input) ? input : [input];

    return this.updateAttributeWithUpsertOrReplacePossibleValues_(
      normalizedInput,
      sharedContext
    );
  }

  @InjectTransactionManager()
  protected async updateAttributeWithUpsertOrReplacePossibleValues_(
    input: Omit<UpdateAttributeDTO, 'product_category_ids'>[],
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    // Handle possible values if they exist
    const possibleValuesInput = input
      .filter(element => element.possible_values && element.possible_values.length > 0)
      .flatMap(element => element.possible_values!);

    let upsertedValues: any[] = [];
    if (possibleValuesInput.length > 0) {
      // Upsert possible values
      upsertedValues = await this.attributePossibleValueRepository_.upsert(
        possibleValuesInput,
        sharedContext
      );
    }

    // Prepare attributes input without possible_values for direct update
    const attributesInput = input.map(toUpdate => {
      const { possible_values, ...attribute } = toUpdate;

      // Only add possible_values if they were provided and upserted
      const attributeData: any = { ...attribute };

      if (possible_values && possible_values.length > 0) {
        attributeData.possible_values = upsertedValues
          .filter(val => val.attribute_id === attribute.id)
          .map(upserted => ({ id: upserted.id }));
      }

      return attributeData;
    });

    return this.attributeRepository_.upsertWithReplace(
      attributesInput,
      { relations: ['possible_values'] },
      sharedContext
    );
  }
}

export default AttributeModuleService;
