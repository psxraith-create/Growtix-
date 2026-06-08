const { buildBusinessReportFromParsed } = require('./src/lib/scoring');
const { validateUploadData } = require('./src/lib/validation');
const xlsx = require('xlsx');
const fs = require('fs');

async function testXLSXIngestion() {
  console.log('=== End-to-End XLSX Data Ingestion Test ===\n');
  
  // Read the test file
  const fileBuffer = fs.readFileSync('./test_data.xlsx');
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet);
  
  console.log('1. File Parsing:');
  console.log(`   ✓ Successfully parsed ${rows.length} rows from XLSX file`);
  console.log(`   ✓ Detected columns: ${Object.keys(rows[0] || {}).join(', ')}`);
  
  // Map rows to the expected format
  const mapRow = (row, index) => ({
    rowNumber: index + 2,
    productName: row['Product Name'] || row.productName,
    category: row.Category || row.category,
    supplierName: row.Supplier || row.supplierName,
    sellingLocation: row.Location || row.sellingLocation,
    unitCost: parseFloat(row['Unit Cost'] || row.unitCost) || null,
    sellingPrice: parseFloat(row['Selling Price'] || row.sellingPrice) || null,
    unitsSold: parseInt(row['Units Sold'] || row.unitsSold) || null,
    stockUnits: parseInt(row['Stock Units'] || row.stockUnits) || null,
  });
  
  const mappedRows = rows.map(mapRow);
  console.log('\n2. Data Mapping:');
  console.log(`   ✓ Mapped ${mappedRows.length} rows to schema`);
  console.log(`   ✓ First product: ${mappedRows[0].productName}`);
  
  // Create parsed data structure
  const parsedData = {
    source: 'excel',
    detectedColumns: Object.keys(rows[0] || {}),
    rows: mappedRows,
    mappedFields: [
      { key: 'productName', label: 'Product Name', required: true, status: 'mapped', matchedColumn: 'Product Name' },
      { key: 'category', label: 'Category', required: true, status: 'mapped', matchedColumn: 'Category' },
      { key: 'supplierName', label: 'Supplier', required: true, status: 'mapped', matchedColumn: 'Supplier' },
      { key: 'sellingLocation', label: 'Location', required: true, status: 'mapped', matchedColumn: 'Location' },
      { key: 'unitCost', label: 'Unit Cost', required: true, status: 'mapped', matchedColumn: 'Unit Cost' },
      { key: 'sellingPrice', label: 'Selling Price', required: true, status: 'mapped', matchedColumn: 'Selling Price' },
      { key: 'unitsSold', label: 'Units Sold', required: true, status: 'mapped', matchedColumn: 'Units Sold' },
      { key: 'stockUnits', label: 'Stock Units', required: true, status: 'mapped', matchedColumn: 'Stock Units' },
    ]
  };
  
  // Validate the data
  const validation = validateUploadData(parsedData);
  console.log('\n3. Data Validation:');
  console.log(`   ✓ Completion rate: ${validation.completionRate}%`);
  console.log(`   ✓ Data quality score: ${validation.dataQualityScore}/100`);
  console.log(`   ✓ Errors found: ${validation.errors.length}`);
  console.log(`   ✓ Warnings found: ${validation.warnings.length}`);
  
  if (validation.errors.length > 0) {
    console.log('\n   Error Details:');
    validation.errors.forEach(error => {
      console.log(`     - Row ${error.rowNumber}: ${error.message}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n   Warning Details:');
    validation.warnings.forEach(warning => {
      console.log(`     - Row ${warning.rowNumber}: ${warning.message}`);
    });
  }
  
  // Build business report
  const report = buildBusinessReportFromParsed(parsedData, validation, 0);
  console.log('\n4. Business Report Generation:');
  console.log(`   ✓ Health score: ${report.healthScore}/100`);
  console.log(`   ✓ Average margin: ${report.averageMarginPercent.toFixed(1)}%`);
  console.log(`   ✓ Products analyzed: ${report.productRows.length}`);
  console.log(`   ✓ Suppliers analyzed: ${report.supplierRows.length}`);
  console.log(`   ✓ Categories analyzed: ${report.categoryRows.length}`);
  
  console.log('\n5. Product Analysis:');
  report.productRows.forEach(product => {
    console.log(`   - ${product.productName}: ${product.score.toFixed(0)} (${product.status})`);
    console.log(`     Margin: ${product.marginPercent.toFixed(1)}%, Revenue: $${product.revenue.toFixed(0)}`);
  });
  
  console.log('\n6. Supplier Analysis:');
  report.supplierRows.forEach(supplier => {
    console.log(`   - ${supplier.supplierName}: ${supplier.score.toFixed(0)} (${supplier.impact})`);
    console.log(`     Products: ${supplier.productsSupplied}, Avg margin: ${supplier.averageMarginPercent.toFixed(1)}%`);
  });
  
  console.log('\n7. Business Insights:');
  console.log('   ✓ Improving factors:');
  report.improvingFactors.forEach(factor => {
    console.log(`     - ${factor}`);
  });
  
  console.log('\n   ⚠ Harming factors:');
  report.harmingFactors.forEach(factor => {
    console.log(`     - ${factor}`);
  });
  
  console.log('\n8. Recommendations:');
  console.log('   ✓ Actions to increase score:');
  report.increaseActions.forEach(action => {
    console.log(`     - ${action}`);
  });
  
  console.log('\n   ❌ Actions to avoid:');
  report.avoidActions.forEach(action => {
    console.log(`     - ${action}`);
  });
  
  // Test expectations
  console.log('\n=== Test Validation ===');
  const tests = [
    { name: 'File parsing', passed: rows.length === 6, expected: '6 rows', actual: `${rows.length} rows` },
    { name: 'Data validation errors', passed: validation.errors.length === 1, expected: '1 error', actual: `${validation.errors.length} errors` },
    { name: 'Data validation warnings', passed: validation.warnings.length === 3, expected: '3 warnings', actual: `${validation.warnings.length} warnings` },
    { name: 'Health score calculation', passed: report.healthScore > 0 && report.healthScore <= 100, expected: '0-100 range', actual: `${report.healthScore}` },
    { name: 'Product scoring', passed: report.productRows.length === 5, expected: '5 valid products', actual: `${report.productRows.length} products` },
    { name: 'Supplier analysis', passed: report.supplierRows.length === 2, expected: '2 suppliers', actual: `${report.supplierRows.length} suppliers` }
  ];
  
  let passedTests = 0;
  tests.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${test.name} - Expected: ${test.expected}, Actual: ${test.actual}`);
    if (test.passed) passedTests++;
  });
  
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passedTests}/${tests.length} tests`);
  console.log(`Success rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  if (passedTests === tests.length) {
    console.log('\n🎉 All tests passed! End-to-end data ingestion pipeline is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
}

testXLSXIngestion().catch(err => {
  console.error('Error during testing:', err);
});