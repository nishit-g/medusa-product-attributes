import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"
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
  toast,
  StatusBadge,
  Tooltip,
  DropdownMenu,
  Copy
} from "@medusajs/ui"
import {
  PencilSquare,
  Trash,
  Plus,
  Tag,
  EllipsisHorizontal,
  Eye,
  EyeSlash,
  Adjustments,
  XMark,
  MagnifyingGlass,
  ArrowPath
} from "@medusajs/icons"
import { CategoryCombobox } from "../../components/category-combobox"

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

type FilterState = {
  search: string
  is_variant_defining?: boolean
  is_filterable?: boolean
  has_categories?: boolean
}

const AttributesPage = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterState>({ search: "" })
  const [showFilters, setShowFilters] = useState(false)

  const prompt = usePrompt()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    handle: '',
    is_variant_defining: false,
    is_filterable: true,
    possible_values: [{ value: '', rank: 1 }],
    product_category_ids: [] as string[]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch attributes
      const attributesResponse = await fetch('/admin/plugin/attributes', {
        credentials: 'include'
      })
      const attributesData = await attributesResponse.json()

      // Fetch categories with nested structure for assignment
      const categoriesResponse = await fetch('/admin/product-categories?include_descendants_tree=true', {
        credentials: 'include'
      })
      const categoriesData = await categoriesResponse.json()

      setAttributes(attributesData.attributes || [])
      setCategories(categoriesData.product_categories || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Error", {
        description: "Failed to fetch attributes data"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAttribute(null)
    setFormData({
      name: '',
      description: '',
      handle: '',
      is_variant_defining: false,
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
      is_variant_defining: attribute.is_variant_defining,
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

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        handle: formData.handle || undefined,
        is_variant_defining: formData.is_variant_defining,
        is_filterable: formData.is_filterable,
        possible_values: formData.possible_values.filter(pv => pv.value.trim()),
        product_category_ids: formData.product_category_ids.length > 0 ? formData.product_category_ids : undefined
      }

      if (editingAttribute) {
        await fetch(`/admin/plugin/attributes/${editingAttribute.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        })
        toast.success("Success", {
          description: "Attribute updated successfully"
        })
      } else {
        await fetch('/admin/plugin/attributes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        })
        toast.success("Success", {
          description: "Attribute created successfully"
        })
      }

      setIsDrawerOpen(false)
      await fetchData()
    } catch (error) {
      console.error('Error saving attribute:', error)
      toast.error("Error", {
        description: "Failed to save attribute"
      })
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
      try {
        await fetch(`/admin/plugin/attributes/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        toast.success("Success", {
          description: "Attribute deleted successfully"
        })
        await fetchData()
      } catch (error) {
        console.error('Error deleting attribute:', error)
        toast.error("Error", {
          description: "Failed to delete attribute"
        })
      }
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
      try {
        await Promise.all(
          Array.from(selectedRows).map(id =>
            fetch(`/admin/plugin/attributes/${id}`, {
              method: 'DELETE',
              credentials: 'include'
            })
          )
        )
        setSelectedRows(new Set())
        toast.success("Success", {
          description: `${selectedRows.size} attributes deleted successfully`
        })
        await fetchData()
      } catch (error) {
        console.error('Error deleting attributes:', error)
        toast.error("Error", {
          description: "Failed to delete attributes"
        })
      }
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
    if (selectedRows.size === filteredAttributes.length && filteredAttributes.length > 0) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredAttributes.map(attr => attr.id)))
    }
  }

  const clearFilters = () => {
    setFilters({ search: "" })
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

  // Filter attributes based on current filters
  const filteredAttributes = attributes.filter(attr => {
    if (filters.search && !attr.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !attr.handle.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.is_variant_defining !== undefined && attr.is_variant_defining !== filters.is_variant_defining) {
      return false
    }
    if (filters.is_filterable !== undefined && attr.is_filterable !== filters.is_filterable) {
      return false
    }
    if (filters.has_categories !== undefined) {
      const hasCategories = (attr.product_categories?.length || 0) > 0
      if (hasCategories !== filters.has_categories) {
        return false
      }
    }
    return true
  })

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <ArrowPath className="animate-spin" />
            <Text>Loading attributes...</Text>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level="h1" className="text-ui-fg-base">
            Attributes
          </Heading>
          <Text className="text-ui-fg-subtle">
            Manage product attributes and their possible values
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
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

      {/* Filters Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ui-fg-muted" />
            <Input
              placeholder="Search attributes..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Adjustments className="mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-ui-tag-blue-bg text-ui-tag-blue-text">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="transparent" onClick={clearFilters} size="small">
              <XMark className="mr-1" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.is_variant_defining === true}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({
                          ...prev,
                          is_variant_defining: checked ? true : undefined
                        }))
                      }
                    />
                    <Text size="small">Variant Defining</Text>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.is_filterable === true}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({
                          ...prev,
                          is_filterable: checked ? true : undefined
                        }))
                      }
                    />
                    <Text size="small">Filterable</Text>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.has_categories === true}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({
                          ...prev,
                          has_categories: checked ? true : undefined
                        }))
                      }
                    />
                    <Text size="small">Category Specific</Text>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.has_categories === false}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({
                          ...prev,
                          has_categories: checked ? false : undefined
                        }))
                      }
                    />
                    <Text size="small">Global</Text>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4">
          <Text size="small" className="text-ui-fg-muted">Total Attributes</Text>
          <Text size="large" weight="plus">{attributes.length}</Text>
        </div>
        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4">
          <Text size="small" className="text-ui-fg-muted">Variant Defining</Text>
          <Text size="large" weight="plus">
            {attributes.filter(a => a.is_variant_defining).length}
          </Text>
        </div>
        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4">
          <Text size="small" className="text-ui-fg-muted">Filterable</Text>
          <Text size="large" weight="plus">
            {attributes.filter(a => a.is_filterable).length}
          </Text>
        </div>
        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4">
          <Text size="small" className="text-ui-fg-muted">Global</Text>
          <Text size="large" weight="plus">
            {attributes.filter(a => !a.product_categories?.length).length}
          </Text>
        </div>
      </div>

      {/* Table */}
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-12">
                <Checkbox
                  checked={selectedRows.size === filteredAttributes.length && filteredAttributes.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </Table.HeaderCell>
              <Table.HeaderCell>Attribute</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Scope</Table.HeaderCell>
              <Table.HeaderCell>Values</Table.HeaderCell>
              <Table.HeaderCell>Categories</Table.HeaderCell>
              <Table.HeaderCell>Last Updated</Table.HeaderCell>
              <Table.HeaderCell className="w-20">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredAttributes.map((attribute) => (
              <Table.Row key={attribute.id}>
                <Table.Cell>
                  <Checkbox
                    checked={selectedRows.has(attribute.id)}
                    onCheckedChange={() => toggleRowSelection(attribute.id)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Text weight="plus" size="small">
                        {attribute.name}
                      </Text>
                      <Copy content={attribute.id} className="text-ui-fg-muted" />
                    </div>
                    <Text size="small" className="text-ui-fg-muted font-mono">
                      {attribute.handle}
                    </Text>
                    {attribute.description && (
                      <Text size="small" className="text-ui-fg-subtle">
                        {attribute.description}
                      </Text>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {attribute.is_variant_defining && (
                      <StatusBadge color="purple">
                        Variant Defining
                      </StatusBadge>
                    )}
                    {attribute.is_filterable && (
                      <StatusBadge color="blue">
                        Filterable
                      </StatusBadge>
                    )}
                    {!attribute.is_variant_defining && !attribute.is_filterable && (
                      <StatusBadge color="grey">
                        Info Only
                      </StatusBadge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {attribute.product_categories?.length ? (
                    <StatusBadge color="orange">
                      Category Specific
                    </StatusBadge>
                  ) : (
                    <StatusBadge color="green">
                      Global
                    </StatusBadge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Tooltip content={`${attribute.possible_values?.length || 0} possible values defined`}>
                    <div className="flex items-center gap-1">
                      <Badge color="purple">
                        {attribute.possible_values?.length || 0}
                      </Badge>
                      {attribute.possible_values?.length ? (
                        <Eye className="text-ui-fg-muted" />
                      ) : (
                        <EyeSlash className="text-ui-fg-muted" />
                      )}
                    </div>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>
                  {attribute.product_categories?.length ? (
                    <Tooltip
                      content={attribute.product_categories.map(c => c.name).join(", ")}
                    >
                      <Badge color="orange">
                        {attribute.product_categories.length} categories
                      </Badge>
                    </Tooltip>
                  ) : (
                    <Text size="small" className="text-ui-fg-muted">
                      All categories
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="text-ui-fg-muted">
                    {attribute.updated_at
                      ? new Date(attribute.updated_at).toLocaleDateString()
                      : "—"
                    }
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <IconButton variant="transparent">
                        <EllipsisHorizontal />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onClick={() => handleEdit(attribute)}>
                        <PencilSquare className="mr-2" />
                        Edit
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        onClick={() => handleDelete(attribute.id)}
                        className="text-ui-fg-error"
                      >
                        <Trash className="mr-2" />
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {filteredAttributes.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              {attributes.length === 0 ? (
                <>
                  <Text className="text-ui-fg-muted mb-2">No attributes found</Text>
                  <Button variant="secondary" onClick={handleCreate}>
                    Create your first attribute
                  </Button>
                </>
              ) : (
                <>
                  <Text className="text-ui-fg-muted mb-2">No attributes match your filters</Text>
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredAttributes.length > 0 && (
        <div className="mt-4">
          <Text size="small" className="text-ui-fg-muted">
            Showing {filteredAttributes.length} of {attributes.length} attributes
          </Text>
        </div>
      )}

      {/* Create/Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-h-[90vh]">
          <Drawer.Header>
            <Drawer.Title>
              {editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
            </Drawer.Title>
            <Drawer.Description>
              {editingAttribute
                ? 'Update the attribute details and configuration'
                : 'Create a new product attribute with possible values'
              }
            </Drawer.Description>
          </Drawer.Header>

          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-120px)]">
            <Drawer.Body className="flex-1 overflow-y-auto px-6">
              <div className="space-y-8 pb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="border-b border-ui-border-base pb-4">
                    <Heading level="h3">Basic Information</Heading>
                    <Text size="small" className="text-ui-fg-subtle">
                      Configure the core attribute properties
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <Label htmlFor="description" className="mb-2">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description for this attribute"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div className="border-b border-ui-border-base pb-4">
                    <Heading level="h3">Configuration</Heading>
                    <Text size="small" className="text-ui-fg-subtle">
                      Define how this attribute behaves in your store
                    </Text>
                  </div>

                  <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Label>Variant Defining</Label>
                        <Text size="small" className="text-ui-fg-subtle">
                          Creates product variants when different values are selected
                        </Text>
                        <Text size="small" className="text-ui-fg-muted">
                          Example: Size and Color attributes create variants like "Red-Small", "Blue-Large"
                        </Text>
                      </div>
                      <Switch
                        checked={formData.is_variant_defining}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, is_variant_defining: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Label>Filterable</Label>
                        <Text size="small" className="text-ui-fg-subtle">
                          Available for filtering products in the storefront
                        </Text>
                        <Text size="small" className="text-ui-fg-muted">
                          Customers can filter by this attribute in product listings
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
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <div className="border-b border-ui-border-base pb-4">
                    <Heading level="h3">Scope</Heading>
                    <Text size="small" className="text-ui-fg-subtle">
                      Control which products can use this attribute
                    </Text>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-ui-bg-field border border-ui-border-base rounded-lg p-3">
                      <Text size="small" className="text-ui-fg-base mb-2">
                        {formData.product_category_ids.length === 0
                          ? "Global Attribute"
                          : "Category Specific Attribute"
                        }
                      </Text>
                      <Text size="small" className="text-ui-fg-muted">
                        {formData.product_category_ids.length === 0
                          ? "Available for all products regardless of category"
                          : `Available only for products in selected categories`
                        }
                      </Text>
                    </div>

                    <CategoryCombobox
                      value={formData.product_category_ids}
                      onChange={(values) =>
                        setFormData(prev => ({ ...prev, product_category_ids: values }))
                      }
                      categories={categories}
                      placeholder="Search and select categories (leave empty for global)..."
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
                </div>

                {/* Possible Values */}
                <div className="space-y-4">
                  <div className="border-b border-ui-border-base pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Heading level="h3">Possible Values</Heading>
                        <Text size="small" className="text-ui-fg-subtle">
                          Define predefined values for this attribute
                        </Text>
                      </div>
                      <Button type="button" variant="secondary" size="small" onClick={addPossibleValue}>
                        <Plus className="mr-2" />
                        Add Value
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-ui-bg-field border border-ui-border-base rounded-lg p-3">
                      <Text size="small" className="text-ui-fg-muted">
                        {formData.possible_values.filter(pv => pv.value.trim()).length === 0
                          ? "No predefined values - customers can enter any value"
                          : `${formData.possible_values.filter(pv => pv.value.trim()).length} predefined values`
                        }
                      </Text>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.possible_values.map((pv, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              value={pv.value}
                              onChange={(e) => updatePossibleValue(index, e.target.value)}
                              placeholder={`Value ${index + 1}`}
                            />
                          </div>
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

                    {formData.possible_values.length === 0 && (
                      <div className="text-center py-8 border border-dashed border-ui-border-base rounded-lg">
                        <Text className="text-ui-fg-muted mb-2">No possible values defined</Text>
                        <Button type="button" variant="secondary" onClick={addPossibleValue}>
                          Add First Value
                        </Button>
                      </div>
                    )}
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
                <Button type="submit">
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
