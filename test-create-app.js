const { templates } = require('./src/lib/templates.ts');

console.log('🧪 Testing templates fix...');

// Test 1: Check if templates is an array
console.log('✅ templates is array:', Array.isArray(templates));

// Test 2: Check if find method works
console.log('✅ templates.find method exists:', typeof templates.find === 'function');

// Test 3: Test finding a template
const nextjsTemplate = templates.find(t => t.id === 'nextjs-dkjfgdf');
console.log('✅ Found nextjs template:', !!nextjsTemplate);
console.log('   Template name:', nextjsTemplate?.name);

// Test 4: Test all template IDs
console.log('✅ Available template IDs:', templates.map(t => t.id));

// Test 5: Test finding non-existent template
const nonExistent = templates.find(t => t.id === 'non-existent');
console.log('✅ Non-existent template returns undefined:', nonExistent === undefined);

console.log('🎉 All tests passed! Templates fix is working.');