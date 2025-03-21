# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
