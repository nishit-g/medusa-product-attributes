import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Container,
  Heading,
  Button,
  Table,
  Badge,
  IconButton,
  Drawer,
  Input,
  Label,
  Textarea,
  Switch,
  Text,
  usePrompt,
  Checkbox,
  toast
} from "@medusajs/ui"
import { PencilSquare, Trash, Plus, Tag } from "@medusajs/icons"
import { CategoryCombobox } from "../../components/category-combobox"
import { sdk } from "../../lib/sdk" // Import your configured SDK

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
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  handle: string
  category_children?: Category[]
}

const AttributesPage = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)

  const prompt = usePrompt()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    handle: '',
    is_filterable: true,
    possible_values: [{ value: '', rank: 1 }],
    product_category_ids: [] as string[]
  })

  // Query for attributes using TanStack Query + SDK
  const {
    data: attributesData,
    isLoading: attributesLoading,
    refetch: refetchAttributes
  } = useQuery({
    queryKey: ["admin-attributes"],
    queryFn: async () => {
      return await sdk.client.fetch(`/admin/plugin/attributes`)
    }
  })

  // Query for categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      return await sdk.client.fetch(`/admin/product-categories`, {
        query: {
          include_descendants_tree: true
        }
      })
    }
  })

  // Create mutation
  const createAttributeMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await sdk.client.fetch(`/admin/plugin/attributes`, {
        method: "POST",
        body: payload
      })
    },
    onSuccess: () => {
      toast.success("Success", { description: "Attribute created successfully" })
      setIsDrawerOpen(false)
      refetchAttributes()
    },
    onError: (error) => {
      console.error('Error creating attribute:', error)
      toast.error("Error", { description: "Failed to create attribute" })
    }
  })

  // Update mutation
  const updateAttributeMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: any }) => {
      return await sdk.client.fetch(`/admin/plugin/attributes/${id}`, {
        method: "POST",
        body: payload
      })
    },
    onSuccess: () => {
      toast.success("Success", { description: "Attribute updated successfully" })
      setIsDrawerOpen(false)
      refetchAttributes()
    },
    onError: (error) => {
      console.error('Error updating attribute:', error)
      toast.error("Error", { description: "Failed to update attribute" })
    }
  })

  // Delete mutation
  const deleteAttributeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await sdk.client.fetch(`/admin/plugin/attributes/${id}`, {
        method: "DELETE"
      })
    },
    onSuccess: () => {
      toast.success("Success", { description: "Attribute deleted successfully" })
      refetchAttributes()
    },
    onError: (error) => {
      console.error('Error deleting attribute:', error)
      toast.error("Error", { description: "Failed to delete attribute" })
    }
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return await sdk.client.fetch(`/admin/plugin/attributes/bulk-delete`, {
        method: "POST",
        body: { ids }
      })
    },
    onSuccess: (_, ids) => {
      toast.success("Success", { description: `${ids.length} attributes deleted successfully` })
      setSelectedRows(new Set())
      refetchAttributes()
    },
    onError: (error) => {
      console.error('Error deleting attributes:', error)
      toast.error("Error", { description: "Failed to delete attributes" })
    }
  })

  const attributes = attributesData?.attributes || []
  const categories = categoriesData?.product_categories || []
  const loading = attributesLoading || categoriesLoading

  const handleCreate = () => {
    setEditingAttribute(null)
    setFormData({
      name: '',
      description: '',
      handle: '',
      is_filterable: true,
      possible_values: [{ value: '', rank: 1 }],
      product_category_ids: []
    })
    setIsDrawerOpen(true)
  }

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setFormData({
      name: attribute.name,
      description: attribute.description || '',
      handle: attribute.handle,
      is_filterable: attribute.is_filterable,
      possible_values: attribute.possible_values?.length
        ? attribute.possible_values
        : [{ value: '', rank: 1 }],
      product_category_ids: attribute.product_categories?.map(c => c.id) || []
    })
    setIsDrawerOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      handle: formData.handle || undefined,
      is_filterable: formData.is_filterable,
      possible_values: formData.possible_values.filter(pv => pv.value.trim()),
      product_category_ids: formData.product_category_ids.length > 0 ? formData.product_category_ids : undefined
    }

    if (editingAttribute) {
      updateAttributeMutation.mutate({ id: editingAttribute.id, payload })
    } else {
      createAttributeMutation.mutate(payload)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await prompt({
      title: "Delete Attribute",
      description: "Are you sure you want to delete this attribute? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })

    if (confirmed) {
      deleteAttributeMutation.mutate(id)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return

    const confirmed = await prompt({
      title: "Delete Attributes",
      description: `Are you sure you want to delete ${selectedRows.size} attribute(s)? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    })

    if (confirmed) {
      bulkDeleteMutation.mutate(Array.from(selectedRows))
    }
  }

  const addPossibleValue = () => {
    setFormData(prev => ({
      ...prev,
      possible_values: [
        ...prev.possible_values,
        { value: '', rank: prev.possible_values.length + 1 }
      ]
    }))
  }

  const updatePossibleValue = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      possible_values: prev.possible_values.map((pv, i) =>
        i === index ? { ...pv, value } : pv
      )
    }))
  }

  const removePossibleValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      possible_values: prev.possible_values.filter((_, i) => i !== index)
    }))
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleAllRows = () => {
    if (selectedRows.size === attributes.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(attributes.map(attr => attr.id)))
    }
  }

  // Helper function to find category by ID in nested structure
  const findCategoryById = (categories: Category[], id: string): Category | null => {
    for (const category of categories) {
      if (category.id === id) {
        return category
      }
      if (category.category_children?.length) {
        const found = findCategoryById(category.category_children, id)
        if (found) return found
      }
    }
    return null
  }

  const isSubmitting = createAttributeMutation.isPending || updateAttributeMutation.isPending

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Text>Loading attributes...</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">Attributes</Heading>
          <Text className="text-ui-fg-subtle">
            Manage product attributes and their possible values
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              isLoading={bulkDeleteMutation.isPending}
            >
              <Trash className="mr-2" />
              Delete ({selectedRows.size})
            </Button>
          )}
          <Button onClick={handleCreate}>
            <Plus className="mr-2" />
            Create Attribute
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-12">
                <Checkbox
                  checked={selectedRows.size === attributes.length && attributes.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Properties</Table.HeaderCell>
              <Table.HeaderCell>Values</Table.HeaderCell>
              <Table.HeaderCell>Categories</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
              <Table.HeaderCell className="w-20">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {attributes.map((attribute) => (
              <Table.Row key={attribute.id}>
                <Table.Cell>
                  <Checkbox
                    checked={selectedRows.has(attribute.id)}
                    onCheckedChange={() => toggleRowSelection(attribute.id)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <Text weight="plus" className="mb-1">
                      {attribute.name}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {attribute.handle}
                    </Text>
                    {attribute.description && (
                      <Text size="small" className="text-ui-fg-muted mt-1">
                        {attribute.description}
                      </Text>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    {attribute.is_filterable && (
                      <Badge color="blue">Filterable</Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">
                    {attribute.possible_values?.length || 0} possible values
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">
                    {attribute.product_categories?.length
                      ? `${attribute.product_categories.length} categories`
                      : "Global"
                    }
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">
                    {attribute.created_at
                      ? new Date(attribute.created_at).toLocaleDateString()
                      : "—"
                    }
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <IconButton
                      variant="transparent"
                      onClick={() => handleEdit(attribute)}
                    >
                      <PencilSquare />
                    </IconButton>
                    <IconButton
                      variant="transparent"
                      onClick={() => handleDelete(attribute.id)}
                      isLoading={deleteAttributeMutation.isPending}
                    >
                      <Trash />
                    </IconButton>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {attributes.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Text className="text-ui-fg-muted mb-2">No attributes found</Text>
              <Button variant="secondary" onClick={handleCreate}>
                Create your first attribute
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-h-[90vh]">
          <Drawer.Header>
            <Drawer.Title>
              {editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
            </Drawer.Title>
          </Drawer.Header>

          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-120px)]">
            <Drawer.Body className="flex-1 overflow-y-auto px-6">
              <div className="space-y-6 pb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <Heading level="h3">Basic Information</Heading>

                  <div>
                    <Label htmlFor="name" className="mb-2">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value,
                        handle: prev.handle || e.target.value.toLowerCase().replace(/\s+/g, '-')
                      }))}
                      placeholder="e.g., Color, Size, Material"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="handle" className="mb-2">Handle</Label>
                    <Input
                      id="handle"
                      value={formData.handle}
                      onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                      placeholder="color, size, material"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="mb-2">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description for this attribute"
                    />
                  </div>
                </div>

                {/* Properties */}
                <div className="space-y-4">
                  <Heading level="h3">Properties</Heading>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Filterable</Label>
                      <Text size="small" className="text-ui-fg-subtle">
                        Available for filtering products in the storefront
                      </Text>
                    </div>
                    <Switch
                      checked={formData.is_filterable}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, is_filterable: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <Heading level="h3">Categories</Heading>
                  <Text size="small" className="text-ui-fg-subtle">
                    Leave empty to make this attribute global (available for all products)
                  </Text>

                  <CategoryCombobox
                    value={formData.product_category_ids}
                    onChange={(values) =>
                      setFormData(prev => ({ ...prev, product_category_ids: values }))
                    }
                    categories={categories}
                    placeholder="Search and select categories..."
                  />

                  {formData.product_category_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {formData.product_category_ids.map(categoryId => {
                        const category = findCategoryById(categories, categoryId)
                        return category ? (
                          <Badge key={categoryId} color="orange">
                            {category.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                {/* Possible Values */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Heading level="h3">Possible Values</Heading>
                    <Button type="button" variant="secondary" onClick={addPossibleValue}>
                      <Plus className="mr-2" />
                      Add Value
                    </Button>
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    Define predefined values for this attribute. Leave empty to allow any value.
                  </Text>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.possible_values.map((pv, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={pv.value}
                          onChange={(e) => updatePossibleValue(index, e.target.value)}
                          placeholder={`Value ${index + 1}`}
                        />
                        {formData.possible_values.length > 1 && (
                          <IconButton
                            type="button"
                            variant="transparent"
                            onClick={() => removePossibleValue(index)}
                          >
                            <Trash />
                          </IconButton>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Drawer.Body>

            <Drawer.Footer className="flex-shrink-0 border-t border-ui-border-base">
              <div className="flex justify-end gap-2 p-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingAttribute ? 'Update' : 'Create'} Attribute
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Attributes",
  icon: Tag,
})

export default AttributesPage
