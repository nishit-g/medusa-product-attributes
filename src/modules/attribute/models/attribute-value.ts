import Attribute from "./attribute";
import { model } from "@medusajs/framework/utils";

const AttributeValue = model.define('attribute_value', {
    id: model.id({ prefix: 'attrval' }).primaryKey(),
    value: model.text(),
    metadata: model.json().nullable(),
    attribute: model.belongsTo(() => Attribute, {
        mappedBy: 'values',
    })
})

export default AttributeValue