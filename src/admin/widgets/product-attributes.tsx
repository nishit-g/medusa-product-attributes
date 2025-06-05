// src/admin/widgets/product-attributes.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"
import {
  Container,
  Heading,
  Button,
  Select,
  Input,
  Badge,
  Text,
  IconButton,
  Label
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
}

interface AttributeValue {
  id: string
  value: string
  attribute: Attribute
}

interface ProductAttributeAssignment {
  attribute_id: string
  value: string
  temp_id?: string // For new assignments
}

const ProductAttributesWidget = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [productAttributes, setProductAttributes] = useState<AttributeValue[]>([])
  const [assignments, setAssignments] = useState<ProductAttributeAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Get product ID from URL
  const getProductId = () => {
    const path = window.location.pathname
    const matches = path.match(/\/products\/([^\/]+)/)
    return matches?.[1]
  }

  const productId = getProductId()

  useEffect(() => {
    if (productId) {
      fetchData()
    }
  }, [productId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch available attributes (admin endpoint)
      const attributesResponse = await fetch('/admin/plugin/attributes', {
        credentials: 'include'
      })
      const attributesData = await attributesResponse.json()
      setAttributes(attributesData.attributes || [])

      // Fetch current product attribute values (admin endpoint)
      try {
        const productResponse = await fetch(`/admin/products/${productId}/attributes`, {
          credentials: 'include'
        })

        if (productResponse.ok) {
          const productData = await productResponse.json()
          setProductAttributes(productData.attribute_values || [])
        } else {
          // If endpoint doesn't exist or no attributes, that's ok
          console.log('No existing product attributes found or endpoint not implemented')
          setProductAttributes([])
        }
      } catch (error) {
        // Product might not have attributes yet, that's ok
        console.log('No existing product attributes found')
        setProductAttributes([])
      }

    } catch (error) {
      console.error('Error fetching attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAttributeAssignment = () => {
    setAssignments(prev => [...prev, {
      attribute_id: '',
      value: '',
      temp_id: `temp_${Date.now()}`
    }])
  }

  const updateAssignment = (index: number, field: keyof ProductAttributeAssignment, value: string) => {
    setAssignments(prev => prev.map((assignment, i) =>
      i === index ? { ...assignment, [field]: value } : assignment
    ))
  }

  const removeAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingAttribute = async (attributeValueId: string) => {
    try {
      const response = await fetch(`/admin/products/${productId}/attributes/${attributeValueId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh data
        await fetchData()
      } else {
        console.error('Failed to remove attribute:', response.statusText)
      }
    } catch (error) {
      console.error('Error removing attribute:', error)
    }
  }

  const saveAttributes = async () => {
    if (!productId) return

    setSaving(true)
    try {
      // Filter out empty assignments
      const validAssignments = assignments.filter(a => a.attribute_id && a.value.trim())

      // Save each assignment
      for (const assignment of validAssignments) {
        const response = await fetch(`/admin/products/${productId}/attributes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            attribute_id: assignment.attribute_id,
            value: assignment.value
          })
        })

        if (!response.ok) {
          console.error('Failed to save attribute:', response.statusText)
        }
      }

      // Clear assignments and refresh
      setAssignments([])
      await fetchData()
    } catch (error) {
      console.error('Error saving attributes:', error)
    } finally {
      setSaving(false)
    }
  }

  const getAvailableAttributes = () => {
    const usedAttributeIds = new Set([
      ...productAttributes.map(pa => pa.attribute.id),
      ...assignments.map(a => a.attribute_id).filter(Boolean)
    ])

    return attributes.filter(attr => !usedAttributeIds.has(attr.id))
  }

  const getAttributeById = (id: string) => {
    return attributes.find(attr => attr.id === id)
  }

  if (loading) {
    return (
      <Container>
        <Text>Loading attributes...</Text>
      </Container>
    )
  }

  if (!productId) {
    return (
      <Container>
        <Text className="text-ui-fg-muted">Product ID not found</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Heading level="h2">Product Attributes</Heading>
          <Button
            variant="secondary"
            size="small"
            onClick={addAttributeAssignment}
            disabled={getAvailableAttributes().length === 0}
          >
            <Plus className="mr-2" />
            Add Attribute
          </Button>
        </div>

        {/* Current Attributes */}
        {productAttributes.length > 0 && (
          <div className="space-y-3">
            <Label>Current Attributes</Label>
            <div className="space-y-2">
              {productAttributes.map((attributeValue) => (
                <div
                  key={attributeValue.id}
                  className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg bg-ui-bg-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <Text weight="plus" size="small">
                        {attributeValue.attribute.name}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {attributeValue.value}
                      </Text>
                    </div>
                    <div className="flex gap-1">
                      {attributeValue.attribute.is_variant_defining && (
                        <Badge color="purple" size="small">Variant</Badge>
                      )}
                      {attributeValue.attribute.is_filterable && (
                        <Badge color="blue" size="small">Filterable</Badge>
                      )}
                    </div>
                  </div>
                  <IconButton
                    variant="transparent"
                    onClick={() => removeExistingAttribute(attributeValue.id)}
                  >
                    <Trash />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Assignments */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <Label>Add New Attributes</Label>
            <div className="space-y-3">
              {assignments.map((assignment, index) => {
                const selectedAttribute = getAttributeById(assignment.attribute_id)

                return (
                  <div key={assignment.temp_id || index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="mb-2">Attribute</Label>
                      <Select
                        value={assignment.attribute_id}
                        onValueChange={(value) => updateAssignment(index, 'attribute_id', value)}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select attribute...">
                            {assignment.attribute_id && (
                              <div className="flex items-center gap-2">
                                <span>{getAttributeById(assignment.attribute_id)?.name}</span>
                                <div className="flex gap-1">
                                  {getAttributeById(assignment.attribute_id)?.is_variant_defining && (
                                    <Badge color="purple" size="small">V</Badge>
                                  )}
                                  {getAttributeById(assignment.attribute_id)?.is_filterable && (
                                    <Badge color="blue" size="small">F</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </Select.Value>
                        </Select.Trigger>
                        <Select.Content>
                          {getAvailableAttributes().map((attribute) => (
                            <Select.Item key={attribute.id} value={attribute.id}>
                              <div className="flex items-center gap-2">
                                <span>{attribute.name}</span>
                                <div className="flex gap-1">
                                  {attribute.is_variant_defining && (
                                    <Badge color="purple" size="small">V</Badge>
                                  )}
                                  {attribute.is_filterable && (
                                    <Badge color="blue" size="small">F</Badge>
                                  )}
                                </div>
                              </div>
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label className="mb-2">Value</Label>
                      {selectedAttribute?.possible_values?.length ? (
                        <Select
                          value={assignment.value}
                          onValueChange={(value) => updateAssignment(index, 'value', value)}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select value...">
                              {assignment.value && <span>{assignment.value}</span>}
                            </Select.Value>
                          </Select.Trigger>
                          <Select.Content>
                            {selectedAttribute.possible_values
                              .sort((a, b) => a.rank - b.rank)
                              .map((pv) => (
                              <Select.Item key={pv.id} value={pv.value}>
                                {pv.value}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Enter custom value..."
                          value={assignment.value}
                          onChange={(e) => updateAssignment(index, 'value', e.target.value)}
                        />
                      )}
                    </div>

                    <IconButton
                      variant="transparent"
                      onClick={() => removeAssignment(index)}
                    >
                      <Trash />
                    </IconButton>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setAssignments([])}
              >
                Cancel
              </Button>
              <Button
                onClick={saveAttributes}
                isLoading={saving}
                disabled={assignments.every(a => !a.attribute_id || !a.value.trim())}
              >
                Save Attributes
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {productAttributes.length === 0 && assignments.length === 0 && (
          <div className="text-center py-8">
            <Text className="text-ui-fg-muted mb-4">
              No attributes assigned to this product
            </Text>
            <Button
              variant="secondary"
              onClick={addAttributeAssignment}
              disabled={attributes.length === 0}
            >
              {attributes.length === 0 ? 'No attributes available' : 'Add First Attribute'}
            </Button>
          </div>
        )}

        {/* Helper Text */}
        <div className="text-xs text-ui-fg-muted border-t pt-4">
          <Text size="small">
            <strong>Tip:</strong> Variant-defining attributes will create product variants automatically.
            Filterable attributes will be available for customer filtering in the storefront.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductAttributesWidget
