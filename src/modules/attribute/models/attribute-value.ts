import { model } from "@medusajs/framework/utils";
import Attribute from "./attribute";

const AttributeValue = model.define('attribute_value', {
    id: model.id({ prefix: 'attrval' }).primaryKey(),
    value: model.text(),
    rank: model.number(),
    metadata: model.json().nullable(),
    attribute: model.belongsTo(() => Attribute, {
        mappedBy: 'values',
    })
}).indexes([
    {
        on: ['attribute_id', 'value'],
        name: 'UQ_attribute_id_value',
        unique: true,
    },
    {
        on: ['attribute_id', 'rank'],
        name: 'UQ_attribute_id_rank',
        unique: true,
    }
])

export default AttributeValue