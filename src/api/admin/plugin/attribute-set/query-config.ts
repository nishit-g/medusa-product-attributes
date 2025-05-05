export const defaultAdminAttributeSetFields = [
    'id',
    'name',
    'description',
    'handle',
    'metadata',
    '*attributes',
    '*attributes.values',
    '*attributes.product_categories'
]

export const retrieveAttributeSetQueryConfig = {
    defaults: defaultAdminAttributeSetFields,
    isList: false,
}

export const listAttributeQueryConfig = {
    ...retrieveAttributeSetQueryConfig,
    defaultLimit: 50,
    isList: true,
}