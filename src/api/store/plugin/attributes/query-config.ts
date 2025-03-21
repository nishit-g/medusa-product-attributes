export const storeDefaultAttributeFields = [
    'id',
    'name',
    'description',
    'handle',
    'metadata',
    '*values',
]

export const retrieveStoreAttributesQueryConfig = {
    defaults: storeDefaultAttributeFields,
    isList: false,
}

export const storeListAttributesQueryConfig = {
    ...retrieveStoreAttributesQueryConfig,
    isList: true,
    defaultLimit: 50,
}