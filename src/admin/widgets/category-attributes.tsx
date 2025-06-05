import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"
import {
  Container,
  Heading,
  Button,
  Badge,
  Text,
  IconButton,
  Label,
  Checkbox,
  toast
} from "@medusajs/ui"
import { Trash, Plus, ExclamationCircle } from "@medusajs/icons"

interface Attribute {
  id: string
  name: string
  description?: string
  handle: string
  is_variant_defining: boolean
  is_filterable: boolean
  possible_values?: Array<{
    id: string
    value: string
    rank: number
  }>
  product_categories?: Array<{
    id: string
    name: string
  }>
}

interface CategoryAttribute {
  id: string
  name: string
  description?: string
  handle: string
  is_variant_defining: boolean
  is_filterable: boolean
  possible_values?: Array<{
    id: string
    value: string
    rank: number
  }>
}

const CategoryAttributesWidget = () => {
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([])
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([])
  const [globalAttributes, setGlobalAttributes] = useState<CategoryAttribute[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<Set<string>>(new Set())

  // Get category ID from URL
  const getCategoryId = () => {
    const path = window.location.pathname
    const matches = path.match(/\/categories\/([^\/]+)/)
    return matches?.[1]
  }

  const categoryId = getCategoryId()

  useEffect(() => {
    if (categoryId) {
      fetchData()
    }
  }, [categoryId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all attributes
      const attributesResponse = await fetch('/admin/plugin/attributes', {
        credentials: 'include'
      })
      const attributesData = await attributesResponse.json()
      const attributes = attributesData.attributes || []
      setAllAttributes(attributes)

      // Separate category-specific and global attributes
      const categorySpecific = attributes.filter((attr: Attribute) =>
        attr.product_categories?.some(cat => cat.id === categoryId)
      )
      const global = attributes.filter((attr: Attribute) =>
        !attr.product_categories?.length
      )

      setCategoryAttributes(categorySpecific)
      setGlobalAttributes(global)

    } catch (error) {
      console.error('Error fetching attributes:', error)
      toast.error("Failed to load attributes")
    } finally {
      setLoading(false)
    }
  }

  const handleAttributeToggle = (attributeId: string) => {
    setSelectedAttributeIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(attributeId)) {
        newSet.delete(attributeId)
      } else {
        newSet.add(attributeId)
      }
      return newSet
    })
  }

  const assignAttributesToCategory = async () => {
    if (!categoryId || selectedAttributeIds.size === 0) return

    setSaving(true)
    try {
      // Update each selected attribute to include this category
      await Promise.all(
        Array.from(selectedAttributeIds).map(async (attributeId) => {
          const attribute = allAttributes.find(attr => attr.id === attributeId)
          if (!attribute) return

          const currentCategoryIds = attribute.product_categories?.map(cat => cat.id) || []
          const updatedCategoryIds = [...currentCategoryIds, categoryId]

          await fetch(`/admin/plugin/attributes/${attributeId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              product_category_ids: updatedCategoryIds
            })
          })
        })
      )

      // Clear selections and refresh
      setSelectedAttributeIds(new Set())
      await fetchData()
      toast.success("Attributes assigned successfully")
    } catch (error) {
      console.error('Error assigning attributes:', error)
      toast.error("Failed to assign attributes")
    } finally {
      setSaving(false)
    }
  }

  const removeAttributeFromCategory = async (attributeId: string) => {
    if (!categoryId) return

    try {
      const attribute = allAttributes.find(attr => attr.id === attributeId)
      if (!attribute) return

      const currentCategoryIds = attribute.product_categories?.map(cat => cat.id) || []
      const updatedCategoryIds = currentCategoryIds.filter(id => id !== categoryId)

      await fetch(`/admin/plugin/attributes/${attributeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_category_ids: updatedCategoryIds
        })
      })

      await fetchData()
      toast.success("Attribute removed from category")
    } catch (error) {
      console.error('Error removing attribute from category:', error)
      toast.error("Failed to remove attribute")
    }
  }

  const getAvailableAttributes = () => {
    return allAttributes.filter(attr =>
      !categoryAttributes.some(catAttr => catAttr.id === attr.id) &&
      !globalAttributes.some(globalAttr => globalAttr.id === attr.id)
    )
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-8">
          <Text size="small" className="text-ui-fg-muted">Loading attributes...</Text>
        </div>
      </Container>
    )
  }

  if (!categoryId) {
    return (
      <Container>
        <div className="flex items-center gap-2 py-6">
          <ExclamationCircle className="text-ui-fg-muted" />
          <Text size="small" className="text-ui-fg-muted">
            Category ID not found
          </Text>
        </div>
      </Container>
    )
  }

  const availableAttributes = getAvailableAttributes()
  const hasAnyAttributes = categoryAttributes.length > 0 || globalAttributes.length > 0 || availableAttributes.length > 0

  return (
    <Container className="px-0">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6">
          <div>
            <Heading level="h3" className="text-ui-fg-base">
              Attributes
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Manage category-specific and global attributes
            </Text>
          </div>
          {selectedAttributeIds.size > 0 && (
            <Button
              variant="secondary"
              size="small"
              onClick={assignAttributesToCategory}
              isLoading={saving}
            >
              <Plus className="mr-1.5" />
              Assign {selectedAttributeIds.size}
            </Button>
          )}
        </div>

        {!hasAnyAttributes ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Text className="text-ui-fg-muted mb-2">
              No attributes found
            </Text>
            <Text size="small" className="text-ui-fg-subtle text-center">
              Create attributes to assign them to this category
            </Text>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category-Specific Attributes */}
            {categoryAttributes.length > 0 && (
              <div className="border-t border-ui-border-base">
                <div className="px-6 py-3 bg-ui-bg-subtle">
                  <Label className="text-xs font-medium text-ui-fg-subtle uppercase tracking-wide">
                    Category Attributes ({categoryAttributes.length})
                  </Label>
                </div>
                <div className="divide-y divide-ui-border-base">
                  {categoryAttributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="flex items-center justify-between px-6 py-3 hover:bg-ui-bg-subtle transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text size="small" weight="plus" className="truncate">
                            {attribute.name}
                          </Text>
                          <div className="flex gap-1">
                            {attribute.is_variant_defining && (
                              <Badge color="purple" size="2xsmall">V</Badge>
                            )}
                            {attribute.is_filterable && (
                              <Badge color="blue" size="2xsmall">F</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            {attribute.handle}
                          </Text>
                          <Badge color="orange" size="2xsmall">
                            {attribute.possible_values?.length || 0} values
                          </Badge>
                        </div>
                      </div>
                      <IconButton
                        variant="transparent"
                        size="small"
                        onClick={() => removeAttributeFromCategory(attribute.id)}
                        className="text-ui-fg-muted hover:text-ui-fg-subtle"
                      >
                        <Trash />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global Attributes */}
            {globalAttributes.length > 0 && (
              <div className="border-t border-ui-border-base">
                <div className="px-6 py-3 bg-ui-bg-field">
                  <Label className="text-xs font-medium text-ui-fg-subtle uppercase tracking-wide">
                    Global Attributes ({globalAttributes.length})
                  </Label>
                </div>
                <div className="divide-y divide-ui-border-base">
                  {globalAttributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="flex items-center px-6 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text size="small" weight="plus" className="truncate">
                            {attribute.name}
                          </Text>
                          <div className="flex gap-1">
                            {attribute.is_variant_defining && (
                              <Badge color="purple" size="2xsmall">V</Badge>
                            )}
                            {attribute.is_filterable && (
                              <Badge color="blue" size="2xsmall">F</Badge>
                            )}
                            <Badge color="green" size="2xsmall">Global</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            {attribute.handle}
                          </Text>
                          <Badge color="orange" size="2xsmall">
                            {attribute.possible_values?.length || 0} values
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Attributes */}
            {availableAttributes.length > 0 && (
              <div className="border-t border-ui-border-base">
                <div className="px-6 py-3 bg-ui-bg-base">
                  <Label className="text-xs font-medium text-ui-fg-subtle uppercase tracking-wide">
                    Available to Assign ({availableAttributes.length})
                  </Label>
                </div>
                <div className="divide-y divide-ui-border-base">
                  {availableAttributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="flex items-center px-6 py-3 hover:bg-ui-bg-subtle transition-colors"
                    >
                      <Checkbox
                        checked={selectedAttributeIds.has(attribute.id)}
                        onCheckedChange={() => handleAttributeToggle(attribute.id)}
                        className="mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text size="small" weight="plus" className="truncate">
                            {attribute.name}
                          </Text>
                          <div className="flex gap-1">
                            {attribute.is_variant_defining && (
                              <Badge color="purple" size="2xsmall">V</Badge>
                            )}
                            {attribute.is_filterable && (
                              <Badge color="blue" size="2xsmall">F</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            {attribute.handle}
                          </Text>
                          <Badge color="orange" size="2xsmall">
                            {attribute.possible_values?.length || 0} values
                          </Badge>
                          {attribute.product_categories?.length && (
                            <Badge color="grey" size="2xsmall">
                              {attribute.product_categories.length} categories
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        {hasAnyAttributes && (
          <div className="border-t border-ui-border-base px-6 py-3">
            <Text size="xsmall" className="text-ui-fg-muted">
              Category attributes are specific to products in this category.
              Global attributes are available to all products.
            </Text>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
})

export default CategoryAttributesWidget
