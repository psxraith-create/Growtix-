const ExcelJS = require('exceljs');

async function createTestXLSX() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  // Add headers
  worksheet.columns = [
    { header: 'Product Name', key: 'productName', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Supplier', key: 'supplierName', width: 25 },
    { header: 'Location', key: 'sellingLocation', width: 15 },
    { header: 'Unit Cost', key: 'unitCost', width: 15 },
    { header: 'Selling Price', key: 'sellingPrice', width: 15 },
    { header: 'Units Sold', key: 'unitsSold', width: 15 },
    { header: 'Stock Units', key: 'stockUnits', width: 15 }
  ];

  // Add test data
  const testData = [
    // Valid product with good margin
    { productName: 'Premium Widget', category: 'Electronics', supplierName: 'TechSupplies Inc', sellingLocation: 'Online', unitCost: 50, sellingPrice: 120, unitsSold: 150, stockUnits: 200 },
    
    // Valid product with moderate margin
    { productName: 'Standard Widget', category: 'Electronics', supplierName: 'TechSupplies Inc', sellingLocation: 'Retail', unitCost: 30, sellingPrice: 65, unitsSold: 300, stockUnits: 150 },
    
    // Product with low margin (should trigger warning)
    { productName: 'Budget Widget', category: 'Electronics', supplierName: 'BudgetSupplies Co', sellingLocation: 'Online', unitCost: 25, sellingPrice: 30, unitsSold: 200, stockUnits: 500 },
    
    // Product with missing required field (should trigger error)
    { productName: 'Incomplete Product', category: 'Accessories', supplierName: '', sellingLocation: 'Retail', unitCost: 10, sellingPrice: 25, unitsSold: 50, stockUnits: 100 },
    
    // Product with negative margin (should trigger warning)
    { productName: 'Loss Leader', category: 'Promotions', supplierName: 'TechSupplies Inc', sellingLocation: 'Online', unitCost: 40, sellingPrice: 35, unitsSold: 100, stockUnits: 50 },
    
    // Product with overstock (should trigger warning)
    { productName: 'Overstocked Item', category: 'Accessories', supplierName: 'BudgetSupplies Co', sellingLocation: 'Warehouse', unitCost: 5, sellingPrice: 15, unitsSold: 20, stockUnits: 1000 }
  ];

  // Add rows
  testData.forEach(product => {
    worksheet.addRow(product);
  });

  // Save the file
  await workbook.xlsx.writeFile('/home/team/shared/business-health-reporter/test_data.xlsx');
  console.log('Test XLSX file created successfully!');
  console.log('File: test_data.xlsx');
  console.log('Rows: ' + testData.length);
  console.log('Expected validation results:');
  console.log('- 1 error (missing supplier)');
  console.log('- 3 warnings (low margin, negative margin, overstock)');
  console.log('- 2 valid products');
}

createTestXLSX().catch(err => {
  console.error('Error creating test file:', err);
});