const fs = require('fs');
const path = require('path');

console.log('=== Supabase SSR Integration Test ===\n');

// Test 1: Check if all required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  'utils/supabase/server.ts',
  'utils/supabase/client.ts',
  'utils/supabase/middleware.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test 2: Check if .env files have the required variables
console.log('\n2. Checking environment variables...');
const envFiles = ['.env', '.env.example'];
let envVarsOk = true;

envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log(`   ${hasAnonKey ? '✅' : '❌'} ${envFile} has NEXT_PUBLIC_SUPABASE_ANON_KEY`);
    if (!hasAnonKey) envVarsOk = false;
  } else {
    console.log(`   ❌ ${envFile} not found`);
    envVarsOk = false;
  }
});

// Test 3: Check file contents for correct imports and structure
console.log('\n3. Checking file contents...');

// Check server.ts
const serverContent = fs.readFileSync(path.join(__dirname, 'utils/supabase/server.ts'), 'utf8');
const hasServerImports = serverContent.includes('createServerClient') && serverContent.includes('@supabase/ssr');
const hasServerCookies = serverContent.includes('cookies()');
console.log(`   ${hasServerImports ? '✅' : '❌'} server.ts has correct imports`);
console.log(`   ${hasServerCookies ? '✅' : '❌'} server.ts uses cookies`);

// Check client.ts
const clientContent = fs.readFileSync(path.join(__dirname, 'utils/supabase/client.ts'), 'utf8');
const hasClientImports = clientContent.includes('createBrowserClient') && clientContent.includes('@supabase/ssr');
console.log(`   ${hasClientImports ? '✅' : '❌'} client.ts has correct imports`);

// Check middleware.ts
const middlewareContent = fs.readFileSync(path.join(__dirname, 'utils/supabase/middleware.ts'), 'utf8');
const hasMiddlewareImports = middlewareContent.includes('createServerClient') && middlewareContent.includes('NextRequest');
const hasMiddlewareCookies = middlewareContent.includes('request.cookies');
console.log(`   ${hasMiddlewareImports ? '✅' : '❌'} middleware.ts has correct imports`);
console.log(`   ${hasMiddlewareCookies ? '✅' : '❌'} middleware.ts handles cookies`);

// Test 4: Check main middleware integration
console.log('\n4. Checking main middleware integration...');
const mainMiddlewareContent = fs.readFileSync(path.join(__dirname, 'middleware.ts'), 'utf8');
const hasSupabaseImport = mainMiddlewareContent.includes('createClient as createSupabaseClient');
const hasSupabaseMiddleware = mainMiddlewareContent.includes('createSupabaseClient(request)');
console.log(`   ${hasSupabaseImport ? '✅' : '❌'} Main middleware imports Supabase middleware`);
console.log(`   ${hasSupabaseMiddleware ? '✅' : '❌'} Main middleware calls Supabase middleware`);

// Test 5: Check package.json for @supabase/ssr
console.log('\n5. Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const hasSsrPackage = packageJson.dependencies && packageJson.dependencies['@supabase/ssr'];
console.log(`   ${hasSsrPackage ? '✅' : '❌'} @supabase/ssr package installed`);

// Summary
console.log('\n=== Test Results ===');
const tests = [
  { name: 'Required files exist', passed: allFilesExist },
  { name: 'Environment variables configured', passed: envVarsOk },
  { name: 'Server utility correct', passed: hasServerImports && hasServerCookies },
  { name: 'Client utility correct', passed: hasClientImports },
  { name: 'Middleware utility correct', passed: hasMiddlewareImports && hasMiddlewareCookies },
  { name: 'Main middleware integration', passed: hasSupabaseImport && hasSupabaseMiddleware },
  { name: 'Package dependencies', passed: hasSsrPackage }
];

let passedTests = 0;
tests.forEach(test => {
  const status = test.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${test.name}`);
  if (test.passed) passedTests++;
});

console.log(`\n📊 Summary: ${passedTests}/${tests.length} tests passed`);

if (passedTests === tests.length) {
  console.log('\n🎉 Supabase SSR integration is complete and ready for use!');
  console.log('\nUsage:');
  console.log('- Server components: import { createClient } from "@/utils/supabase/server"');
  console.log('- Client components: import { createClient } from "@/utils/supabase/client"');
  console.log('- Middleware: Automatically handles session refresh');
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.');
}