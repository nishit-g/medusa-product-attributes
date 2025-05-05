import Attribute from "./attribute"
import { model } from "@medusajs/framework/utils"

const AttributeSet = model.define('attribute_set', {
    id: model.id({ prefix: 'attrset' }).primaryKey(),
    name: model.text().index('IDX_ATTRIBUTE_SET_NAME').searchable(),
    description: model.text().nullable(),
    handle: model.text().unique(),
    metadata: model.json().nullable(),
    attributes: model.manyToMany(() => Attribute, {
        mappedBy: 'sets',
        pivotTable: 'attribute_set_attributes',
        join_column: 'attribute_set_id',
        inverseJoinColumn: 'attribute_id',
    }),
})

export default AttributeSet 