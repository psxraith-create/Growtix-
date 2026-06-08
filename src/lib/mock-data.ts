import {
  ParsedUploadData,
  UploadSource,
  UploadedProductRow,
  uploadFieldSchema,
  FieldMappingResult,
} from "@/lib/schema"

type RawUploadRow = Record<string, string | number | null>

const mockRawUploadRows: RawUploadRow[] = [
  {
    Name: "Organic Cotton Tote",
    Category: "Bags",
    Vendor: "EcoSource Ltd",
    Region: "Northeast",
    Cost_Per_Unit: 5.5,
    Price_USD: 15.99,
    Sales_Volume: 1240,
    Stock_Units: 420,
  },
  {
    Name: "Eco-Friendly Water Bottle",
    Category: "Kitchenware",
    Vendor: "Global Logistics Co",
    Region: "Midwest",
    Cost_Per_Unit: 8.2,
    Price_USD: 18.5,
    Sales_Volume: 930,
    Stock_Units: 280,
  },
  {
    Name: "Bamboo Toothbrush Set",
    Category: "Personal Care",
    Vendor: "EcoSource Ltd",
    Region: "South",
    Cost_Per_Unit: 2.1,
    Price_USD: 4,
    Sales_Volume: 1600,
    Stock_Units: 540,
  },
  {
    Name: "Recycled Paper Notebook",
    Category: "Stationery",
    Vendor: "Standard Fabrics Inc",
    Region: "West",
    Cost_Per_Unit: 4.5,
    Price_USD: 6.99,
    Sales_Volume: 340,
    Stock_Units: 760,
  },
  {
    Name: "Leather Wallet",
    Category: "Accessories",
    Vendor: "Standard Fabrics Inc",
    Region: "West",
    Cost_Per_Unit: null,
    Price_USD: 34.99,
    Sales_Volume: 120,
    Stock_Units: 640,
  },
  {
    Name: "Canvas Lunch Bag",
    Category: "Bags",
    Vendor: "",
    Region: "Northeast",
    Cost_Per_Unit: 6.8,
    Price_USD: 8.25,
    Sales_Volume: 90,
    Stock_Units: 310,
  },
  {
    Name: "Organic Cotton Tote",
    Category: "Bags",
    Vendor: "EcoSource Ltd",
    Region: "Northeast",
    Cost_Per_Unit: 5.75,
    Price_USD: 15.99,
    Sales_Volume: 180,
    Stock_Units: 110,
  },
]

export interface SupplierBenchmark {
  supplierName: string
  leadTimeDays: number
  reliabilityRate: number
  defectRate: number
}

export const mockSupplierBenchmarks: SupplierBenchmark[] = [
  {
    supplierName: "EcoSource Ltd",
    leadTimeDays: 3,
    reliabilityRate: 96,
    defectRate: 1.8,
  },
  {
    supplierName: "Global Logistics Co",
    leadTimeDays: 5,
    reliabilityRate: 89,
    defectRate: 2.9,
  },
  {
    supplierName: "Standard Fabrics Inc",
    leadTimeDays: 11,
    reliabilityRate: 74,
    defectRate: 6.1,
  },
]

function normalizeText(value: unknown): string {
  return String(value ?? "").trim()
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const cleaned = String(value).replace(/[$,%\s,]/g, "")
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function findMappedColumn(row: RawUploadRow, aliases: string[]): string | null {
  const keys = Object.keys(row)

  const match = keys.find((key) => {
    const normalized = key.toLowerCase().trim()
    return aliases.some((alias) => alias.toLowerCase() === normalized)
  })

  return match ?? null
}

function mapFields(detectedColumns: string[]): FieldMappingResult[] {
  return uploadFieldSchema.map((field) => {
    const matchedColumn = detectedColumns.find((column) => {
      const normalized = column.toLowerCase().trim()
      return [field.key, ...field.acceptedAliases].some(
        (alias) => alias.toLowerCase() === normalized
      )
    })

    return {
      key: field.key,
      label: field.label,
      matchedColumn: matchedColumn ?? null,
      required: field.required,
      status: matchedColumn ? "mapped" : "missing",
    }
  })
}

function toUploadedRow(raw: RawUploadRow, rowNumber: number): UploadedProductRow {
  const productNameKey = findMappedColumn(raw, ["productname", "name", "product", "item_name", "product_name"])
  const categoryKey = findMappedColumn(raw, ["category", "type", "group", "category_name"])
  const supplierKey = findMappedColumn(raw, ["suppliername", "vendor", "supplier", "supplier_name"])
  const locationKey = findMappedColumn(raw, ["sellinglocation", "region", "market", "location", "selling_location"])
  const costKey = findMappedColumn(raw, ["unitcost", "cost", "cost_per_unit", "cogs"])
  const priceKey = findMappedColumn(raw, ["sellingprice", "price", "price_usd", "retail_price"])
  const soldKey = findMappedColumn(raw, ["unitssold", "sales_volume", "units", "qty_sold"])
  const stockKey = findMappedColumn(raw, ["stockunits", "inventory", "stock", "on_hand"])

  return {
    rowNumber,
    productName: normalizeText(productNameKey ? raw[productNameKey] : ""),
    category: normalizeText(categoryKey ? raw[categoryKey] : ""),
    supplierName: normalizeText(supplierKey ? raw[supplierKey] : ""),
    sellingLocation: normalizeText(locationKey ? raw[locationKey] : ""),
    unitCost: normalizeNumber(costKey ? raw[costKey] : null),
    sellingPrice: normalizeNumber(priceKey ? raw[priceKey] : null),
    unitsSold: normalizeNumber(soldKey ? raw[soldKey] : null),
    stockUnits: normalizeNumber(stockKey ? raw[stockKey] : null),
  }
}

export function parseMockUploadData(source: UploadSource = "excel"): ParsedUploadData {
  const detectedColumns = Object.keys(mockRawUploadRows[0] ?? {})

  return {
    source,
    detectedColumns,
    mappedFields: mapFields(detectedColumns),
    rows: mockRawUploadRows.map((row, index) => toUploadedRow(row, index + 2)),
  }
}
