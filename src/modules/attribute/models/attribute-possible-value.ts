import Attribute from "./attribute";
import { model } from "@medusajs/framework/utils";

const AttributePossibleValue = model.define('attribute_possible_value', {
    id: model.id({ prefix: 'attrposval' }).primaryKey(),
    value: model.text(),
    rank: model.number(),
    metadata: model.json().nullable(),
    attribute: model.belongsTo(() => Attribute, {
        mappedBy: 'possible_values',
    })
}).indexes([
    {
        on: ['attribute_id', 'value'],
        name: 'UQ_attribute_id_value',
        unique: true,
    }
])

export default AttributePossibleValue