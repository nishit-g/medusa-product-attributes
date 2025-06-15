export const defaultAdminAttributeFields = [
    'id',
    'name',
    'description',
    'is_filterable',
    'handle',
    'metadata',
    '*possible_values',
    '*product_categories'
]

export const retrieveAttributeQueryConfig = {
    defaults: defaultAdminAttributeFields,
    isList: false,
}

export const listAttributeQueryConfig = {
    ...retrieveAttributeQueryConfig,
    defaultLimit: 50,
    isList: true,
}

export const defaultAdminAttributeValueFields = [
    'id',
    'value',
    'rank',
]

export const retrieveAttributeValueQueryConfig = {
    defaults: defaultAdminAttributeValueFields,
    isList: false,
}

export const listAttributeValueQueryConfig = {
    ...retrieveAttributeValueQueryConfig,
    isList: true,
    defaultLimit: 50,
}
