import Medusa from "@medusajs/js-sdk"

// For plugins, use the global __BACKEND_URL__ variable
// For Medusa projects, use import.meta.env.VITE_MEDUSA_BACKEND_URL
export const sdk = new Medusa({
  baseUrl: __BACKEND_URL__, // This is automatically available in plugins
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session" // Uses cookie session authentication
  }
})
