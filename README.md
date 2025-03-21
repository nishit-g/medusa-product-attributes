# @nicogorga/medusa-product-attributes

Create global (category specific) product attributes on your Medusa commerce application

> [!WARNING]
> This plugin is a WIP and I am working on it in my spare time between projects and work. Feel free to make contributions by making pull requests and proposing ideas / new flows to implement via [Discussions](https://github.com/NicolasGorga/medusa-product-attributes/discussions)
> If this helps you, you can buy me a :coffee: or reach out to me if you need help with your MedusaJS projects :wink:

## Compatibility

This plugin is compatible with versions >= 2.6.1 of `@medusajs/medusa`. 

## Progress 

All the work has so far been done on the backend (API Layer + Workflows):

- Create, retrieve and list attributes
- Link \ unlink attributes to categories
- Create values for said attributes
- Update, delete, insert new values for existent attributes
    - Values can initially be created on POST /admin/plugin/attributes endpoint
    - For existent attributes, values can be created, updated, deleted depending on what is passed to POST /admin/plugin/attributes/attrId endpoint and what is currently stored in the DB

## Roadmap

- Allow to filter products based on their attribute values
- Introduce entities to facilitate constructing UI components in Admin Panel and filtering them in Storefront
- Create Admin panel route / widgets to interact with attribute / attribute values and link them to products
- Create adaptation of starter to show example of Storefront filtering products with attributes

## Prerequisites

- [Node.js v20 or greater](https://nodejs.org/en)
- [A Medusa backend](https://docs.medusajs.com/learn/installation)

## How to Install

1\. Run the following command in the directory of the Medusa backend using your package manager (for example for npm):

  ```bash
  npm install @nicogorga/medusa-product-attributes
  ```

2\. In `medusa-config.ts` add the following at the end of the `plugins` array in your project config object:

  ```js
  projectConfig: {
    plugins = [
    // ...
    {
      resolve: `@nicogorga/medusa-product-attributes`,
    },
  ]
  }
  ```

## Additional Resources

- [medusa-custom-attributes v1](https://github.com/vholik/medusa-custom-attributes)
Props to [Viktor Holik](https://github.com/vholik), the creator, for his work as it is a great reference and has proved to be open to help
- Github Discussions
  - [Global / Category Based Product Options](https://github.com/medusajs/medusa/discussions/11910)
  - [Global variant options and variant generator](https://github.com/medusajs/medusa/discussions/5119)