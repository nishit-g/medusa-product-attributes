import AttributeModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ATTRIBUTE_MODULE = 'attribute'

export default Module(ATTRIBUTE_MODULE, {
    service: AttributeModuleService,
})