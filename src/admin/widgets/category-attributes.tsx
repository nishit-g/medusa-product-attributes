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
  Checkbox
} from "@medusajs/ui"
import {Trash, Plus} from "@medusajs/icons"

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
      for (const attributeId of selectedAttributeIds) {
        const attribute = allAttributes.find(attr => attr.id === attributeId)
        if (!attribute) continue

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
      }

      // Clear selections and refresh
      setSelectedAttributeIds(new Set())
      await fetchData()
    } catch (error) {
      console.error('Error assigning attributes:', error)
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
    } catch (error) {
      console.error('Error removing attribute from category:', error)
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
        <Text>Loading category attributes...</Text>
      </Container>
    )
  }

  if (!categoryId) {
    return (
      <Container>
        <Text className="text-ui-fg-muted">Category ID not found</Text>
      </Container>
    )
  }

  const availableAttributes = getAvailableAttributes()

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">Category Attributes</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Manage attributes specific to this category
            </Text>
          </div>
          {selectedAttributeIds.size > 0 && (
            <Button
              onClick={assignAttributesToCategory}
              isLoading={saving}
            >
              <Plus className="mr-2" />
              Assign ({selectedAttributeIds.size}) Attributes
            </Button>
          )}
        </div>

        {/* Category-Specific Attributes */}
        {categoryAttributes.length > 0 && (
          <div className="space-y-3">
            <Label>Category-Specific Attributes</Label>
            <div className="space-y-2">
              {categoryAttributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg bg-ui-bg-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <Text weight="plus" size="small">
                        {attribute.name}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {attribute.handle}
                      </Text>
                      {attribute.description && (
                        <Text size="small" className="text-ui-fg-muted">
                          {attribute.description}
                        </Text>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {attribute.is_variant_defining && (
                        <Badge color="purple" size="small">Variant</Badge>
                      )}
                      {attribute.is_filterable && (
                        <Badge color="blue" size="small">Filterable</Badge>
                      )}
                      <Badge color="orange" size="small">
                        {attribute.possible_values?.length || 0} values
                      </Badge>
                    </div>
                  </div>
                  <IconButton
                    variant="transparent"
                    onClick={() => removeAttributeFromCategory(attribute.id)}
                  >
                    <Trash />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Attributes (Inherited) */}
        {globalAttributes.length > 0 && (
          <div className="space-y-3">
            <Label>Global Attributes (Available to all categories)</Label>
            <div className="space-y-2">
              {globalAttributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg bg-ui-bg-field"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <Text weight="plus" size="small">
                        {attribute.name}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {attribute.handle} • Global
                      </Text>
                      {attribute.description && (
                        <Text size="small" className="text-ui-fg-muted">
                          {attribute.description}
                        </Text>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {attribute.is_variant_defining && (
                        <Badge color="purple" size="small">Variant</Badge>
                      )}
                      {attribute.is_filterable && (
                        <Badge color="blue" size="small">Filterable</Badge>
                      )}
                      <Badge color="green" size="small">Global</Badge>
                      <Badge color="orange" size="small">
                        {attribute.possible_values?.length || 0} values
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Attributes to Assign */}
        {availableAttributes.length > 0 && (
          <div className="space-y-3">
            <Label>Available Attributes to Assign</Label>
            <div className="space-y-2">
              {availableAttributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedAttributeIds.has(attribute.id)}
                      onCheckedChange={() => handleAttributeToggle(attribute.id)}
                    />
                    <div>
                      <Text weight="plus" size="small">
                        {attribute.name}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {attribute.handle}
                      </Text>
                      {attribute.description && (
                        <Text size="small" className="text-ui-fg-muted">
                          {attribute.description}
                        </Text>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {attribute.is_variant_defining && (
                        <Badge color="purple" size="small">Variant</Badge>
                      )}
                      {attribute.is_filterable && (
                        <Badge color="blue" size="small">Filterable</Badge>
                      )}
                      <Badge color="orange" size="small">
                        {attribute.possible_values?.length || 0} values
                      </Badge>
                      {attribute.product_categories?.length ? (
                        <Badge color="grey" size="small">
                          {attribute.product_categories.length} categories
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {categoryAttributes.length === 0 && globalAttributes.length === 0 && availableAttributes.length === 0 && (
          <div className="text-center py-8">
            <Text className="text-ui-fg-muted mb-4">
              No attributes found. Create some attributes first.
            </Text>
            <Button variant="secondary">
              Create First Attribute
            </Button>
          </div>
        )}

        {categoryAttributes.length === 0 && availableAttributes.length === 0 && globalAttributes.length > 0 && (
          <div className="text-center py-8">
            <Text className="text-ui-fg-muted mb-4">
              This category only has global attributes. Global attributes are automatically available to all products in any category.
            </Text>
          </div>
        )}

        {/* Helper Text */}
        <div className="text-xs text-ui-fg-muted border-t pt-4">
          <Text size="small">
            <strong>Tip:</strong> Category-specific attributes only appear for products in this category.
            Global attributes are available to all products regardless of category.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
})

export default CategoryAttributesWidget
