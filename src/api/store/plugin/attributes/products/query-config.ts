import { defaultStoreProductFields } from "@medusajs/medusa/api/store/products/query-config";

const defaultExtendedStoreProductFields = [
    '*attribute_values',
]

export const retrieveProductQueryConfig = {
    defaults: [
        ...defaultStoreProductFields,
        ...defaultExtendedStoreProductFields
    ],
    isList: false,
} 

export const listProductQueryConfig = {
    ...retrieveProductQueryConfig,
    isList: true,
    defaultLimit: 50,
}