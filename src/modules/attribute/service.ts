import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils";
import Attribute from "./models/attribute";
import { Context, DAL } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";
import {
  CreateAttributeValueDTO,
  UpdateAttributeDTO,
  UpsertAttributeValueDTO,
  UpdateAttributeValueDTO,
} from "../../types/attribute";
import AttributeValue from "./models/attribute-value";

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService;
};

class AttributeModuleService extends MedusaService({
  Attribute,
  AttributeValue,
}) {
  protected baseRepository_: DAL.RepositoryService;

  constructor({ baseRepository }: InjectedDependencies) {
    super(...arguments);
    this.baseRepository_ = baseRepository;
  }

  /**
   *
   * @param input
   * @param sharedContext
   *
   * Useful to update attribute, allowing to upsert values in the same operation. If "id"
   * is not porvided for "values" entries, it will lookup the DB by attributeValue.value,
   * to update or create accordingly.
   * 
   * Assumes caller will eventually refetch entities, for now, to reduce complexity of this 
   * method and concentrate on upserting like ProductOption - ProductOptionValue from Medusa
   */
  @InjectManager()
  async upsertAttributeValues(
    input: UpdateAttributeDTO | UpdateAttributeDTO[],
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    const normalizedAttributesInput = (
      Array.isArray(input) ? input : [input]
    ).map((attr) => {
      const { values, ...attribute } = attr;
      return {
        attribute,
        values,
      };
    });

    const attributes = normalizedAttributesInput.map(
      ({ attribute }) => attribute
    );

    await this.updateAttributes(attributes, undefined, sharedContext);

    const normalizedAttributeValuesInput = (
      Array.isArray(input) ? input : [input]
    )
      .filter((attr) => attr.values?.length)
      .flatMap((attr) =>
        attr.values!.map((attrVal) => ({
          ...attrVal,
          attribute_id: attr.id,
        }))
      );

    if (!normalizedAttributeValuesInput.length) {
      return;
    }

    return await this.upsertAttributeValues_(
      normalizedAttributeValuesInput,
      sharedContext
    );
  }

  @InjectTransactionManager()
  protected async upsertAttributeValues_(
    input: UpsertAttributeValueDTO[],
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    const attributeIds = [
      ...new Set(
        input.filter((val) => val.attribute_id).map((val) => val.attribute_id)
      ),
    ];

    const dbValues = await this.listAttributeValues(
      { attribute_id: attributeIds },
      { relations: ["attribute"] },
      sharedContext
    );

    const toCreate: CreateAttributeValueDTO[] = [];
    const toUpdate: UpdateAttributeValueDTO[] = [];

    for (const attributeValue of input) {
      const existentValue = attributeValue.id
        ? attributeValue
        : dbValues.find((dbVal) => dbVal.value === attributeValue.value);
      if (existentValue) {
        toUpdate.push({
          ...attributeValue,
          id: existentValue.id!,
        });
      } else {
        //@ts-expect-error
        toCreate.push(attributeValue);
      }
    }

    await Promise.all([
      this.createAttributeValues(toCreate),
      this.updateAttributeValues(toUpdate),
    ]);
    return;
  }
}

export default AttributeModuleService;
