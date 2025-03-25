# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- `addGlobalAttributesIfNecessary` middleware to allow returning global attributes when requesting attributes linked to a category, by specifying `include_globals` query param. Defaults to true if not specified

## 1.0.0 - 2025-03-25
### Added
- Added utility function `productsCreatedHookHandler` to incorporate in your own productCreated hook handler

### Removed
- productsCreated hook handler. This is a breaking change and i decided to do this because of [this issue](https://github.com/medusajs/medusa/issues/11968). See README section 3.

## 0.3.0 - 2025-03-23
### Added
- ability to query products passing `attribute_value_id` filter, to filter by linked attribute values. Recreating the core /store/products route in
  /store/plugin/attributes/products route, until i get a response from Medusa regarding [this issue](https://github.com/medusajs/medusa/issues/11938).
  Since there are also limitations on complef filtering for linked tables, the values passed for `attribute_value_id` are applied with OR

## 0.2.0 - 2025-03-21
### Added
- /store/plugin/attributes route to list attributes from storefront and apply query params filters
- applyCategoryFilterIfNecessary middleware to support filtering by product category link, passing "categories" array
  as query param. Doesn't handle categories inside $and or $or params yet

### Changed
- Unique constraint on attribute_value table (attribute_id, rank), since when updating values for an attribute and swapping the "rank"
  values, the constraint made it throw. Until i find a way to do this, you could have duplicated attribute_id, rank

## 0.1.1 - 2025-03-21
### Added
- Manual update to changelog, due to problems when first trying the Github release workflow

## 0.1.0 - 2024-03-21
### Added
- Changelog
- Link attribute values to products including additional_data.values on /admin/products

## 0.0.1 - 2024-03-20
### Added
- Create, retrieve and list attributes
- Link \ unlink attributes to categories
- Create values for said attributes
- Update, delete, insert new values for existent attributes
    - Values can initially be created on POST /admin/plugin/attributes endpoint
    - For existent attributes, values can be created, updated, deleted depending on what is passed to POST /admin/plugin/attributes/attrId endpoint and what is currently stored in the DB
