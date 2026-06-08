export type UploadSource = "excel" | "csv" | "google-sheets"

export type FieldType = "string" | "number" | "currency"

export interface UploadFieldDefinition {
  key: keyof UploadedProductRow
  label: string
  required: boolean
  type: FieldType
  description: string
  acceptedAliases: string[]
}

export interface UploadedProductRow {
  rowNumber: number
  productName: string
  category: string
  supplierName: string
  sellingLocation: string
  unitCost: number | null
  sellingPrice: number | null
  unitsSold: number | null
  stockUnits: number | null
}

export interface FieldMappingResult {
  key: keyof UploadedProductRow
  label: string
  matchedColumn: string | null
  required: boolean
  status: "mapped" | "missing"
}

export interface ParsedUploadData {
  source: UploadSource
  detectedColumns: string[]
  mappedFields: FieldMappingResult[]
  rows: UploadedProductRow[]
}

export type ValidationSeverity = "error" | "warning"

export interface ValidationIssue {
  severity: ValidationSeverity
  code: string
  rowNumber?: number
  field?: keyof UploadedProductRow
  message: string
  recommendation: string
}

export interface ValidationResult {
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  dataQualityScore: number
  completionRate: number
}

export const uploadFieldSchema: UploadFieldDefinition[] = [
  {
    key: "productName",
    label: "Product Name",
    required: true,
    type: "string",
    description: "Main product name used in reports",
    acceptedAliases: ["name", "product", "item_name", "product_name"],
  },
  {
    key: "category",
    label: "Category",
    required: true,
    type: "string",
    description: "Product category for comparisons",
    acceptedAliases: ["type", "group", "category_name"],
  },
  {
    key: "supplierName",
    label: "Supplier",
    required: true,
    type: "string",
    description: "Supplier/vendor used for the product",
    acceptedAliases: ["vendor", "supplier", "supplier_name"],
  },
  {
    key: "sellingLocation",
    label: "Location",
    required: true,
    type: "string",
    description: "Where the product is sold",
    acceptedAliases: ["region", "market", "location", "selling_location"],
  },
  {
    key: "unitCost",
    label: "Unit Cost",
    required: true,
    type: "currency",
    description: "Cost per unit",
    acceptedAliases: ["cost", "cost_per_unit", "unit_cost", "cogs"],
  },
  {
    key: "sellingPrice",
    label: "Selling Price",
    required: true,
    type: "currency",
    description: "Selling price per unit",
    acceptedAliases: ["price", "price_usd", "selling_price", "retail_price"],
  },
  {
    key: "unitsSold",
    label: "Units Sold",
    required: true,
    type: "number",
    description: "Units sold for the period",
    acceptedAliases: ["sales_volume", "units", "units_sold", "qty_sold"],
  },
  {
    key: "stockUnits",
    label: "Stock Units",
    required: false,
    type: "number",
    description: "Current stock level",
    acceptedAliases: ["inventory", "stock", "stock_units", "on_hand"],
  },
]
