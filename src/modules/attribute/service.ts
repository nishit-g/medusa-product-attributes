import { MedusaService } from "@medusajs/framework/utils";
import Attribute from "./models/attribute";
import AttributeValue from "./models/attribute-value";

class AttributeModuleService extends MedusaService({
    Attribute,
    AttributeValue,
}){}

export default AttributeModuleService