#!/usr/bin/env node

/**
 * Simple test runner for CodeRabbit Workflows
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running CodeRabbit Workflows Tests...');
console.log('==========================================');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test files exist
test('Workflows file exists', () => {
  const workflowPath = path.join(__dirname, '.warp', 'workflows.yaml');
  if (!fs.existsSync(workflowPath)) {
    throw new Error('workflows.yaml not found');
  }
});

test('Apply script exists', () => {
  const scriptPath = path.join(__dirname, 'scripts', 'apply_coderabbit_suggestions.js');
  if (!fs.existsSync(scriptPath)) {
    throw new Error('apply_coderabbit_suggestions.js not found');
  }
});

test('Documentation exists', () => {
  const docsPath = path.join(__dirname, '.warp', 'README.md');
  if (!fs.existsSync(docsPath)) {
    throw new Error('README.md not found');
  }
});

test('Server module loads', () => {
  const serverPath = path.join(__dirname, 'server.js');
  if (!fs.existsSync(serverPath)) {
    throw new Error('server.js not found');
  }
  require('./server.js');
});

test('Package.json valid', () => {
  const pkg = require('./package.json');
  if (!pkg.name || !pkg.version) {
    throw new Error('Invalid package.json');
  }
});

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n🚨 Some tests failed!');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
