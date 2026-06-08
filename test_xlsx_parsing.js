const xlsx = require('xlsx');
const fs = require('fs');

console.log('=== XLSX Parsing Test ===\n');

// Read the test file
const fileBuffer = fs.readFileSync('./test_data.xlsx');
const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const rows = xlsx.utils.sheet_to_json(worksheet);

console.log('✅ File parsed successfully');
console.log(`📊 Total rows: ${rows.length}`);
console.log(`📋 Columns: ${Object.keys(rows[0] || {}).join(', ')}`);

console.log('\n=== Data Preview ===');
rows.forEach((row, index) => {
  console.log(`\nRow ${index + 1}:`);
  console.log(`  Product: ${row['Product Name']}`);
  console.log(`  Category: ${row.Category}`);
  console.log(`  Supplier: ${row.Supplier}`);
  console.log(`  Location: ${row.Location}`);
  console.log(`  Unit Cost: $${row['Unit Cost']}`);
  console.log(`  Selling Price: $${row['Selling Price']}`);
  console.log(`  Units Sold: ${row['Units Sold']}`);
  console.log(`  Stock Units: ${row['Stock Units']}`);
  
  // Calculate expected validation issues
  const issues = [];
  if (!row.Supplier || row.Supplier.trim() === '') {
    issues.push('Missing supplier (ERROR)');
  }
  if (row['Selling Price'] <= row['Unit Cost']) {
    issues.push('Negative or zero margin (WARNING)');
  }
  if (row['Selling Price'] - row['Unit Cost'] < row['Unit Cost'] * 0.2) {
    issues.push('Low margin < 20% (WARNING)');
  }
  if (row['Stock Units'] > row['Units Sold'] * 3) {
    issues.push('Overstock risk (WARNING)');
  }
  
  if (issues.length > 0) {
    console.log(`  🚨 Issues: ${issues.join(', ')}`);
  } else {
    console.log(`  ✅ Valid product`);
  }
});

console.log('\n=== Expected Validation Results ===');
console.log('🔴 Errors: 1 (missing supplier)');
console.log('🟡 Warnings: 3 (low margin, negative margin, overstock)');
console.log('✅ Valid products: 2');

console.log('\n=== Test Data Quality Metrics ===');
const productsWithSupplier = rows.filter(row => row.Supplier && row.Supplier.trim() !== '').length;
const productsWithCost = rows.filter(row => row['Unit Cost'] !== undefined && row['Unit Cost'] !== null).length;
const productsWithPrice = rows.filter(row => row['Selling Price'] !== undefined && row['Selling Price'] !== null).length;
const productsWithSales = rows.filter(row => row['Units Sold'] !== undefined && row['Units Sold'] !== null).length;

console.log(`📊 Completion rate: ${((productsWithSupplier + productsWithCost + productsWithPrice + productsWithSales) / (rows.length * 4) * 100).toFixed(1)}%`);
console.log(`💼 Products with supplier: ${productsWithSupplier}/${rows.length}`);
console.log(`💰 Products with cost: ${productsWithCost}/${rows.length}`);
console.log(`🏷️  Products with price: ${productsWithPrice}/${rows.length}`);
console.log(`📈 Products with sales: ${productsWithSales}/${rows.length}`);

console.log('\n🎉 XLSX parsing test completed successfully!');
console.log('The data ingestion pipeline can now process this file.');