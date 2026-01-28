#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Run license‑checker and capture JSON output
let raw;
try {
  raw = execSync('npx license-checker --json --production', { stdio: 'pipe' });
} catch (err) {
  console.error('license-checker failed to run:', err.message);
  process.exit(2);
}

let data;
try {
  data = JSON.parse(raw.toString());
} catch (e) {
  console.error('Could not parse license-checker JSON output');
  process.exit(3);
}

const FORBIDDEN = new Set(['AML', 'TCL']);

const offenders = Object.entries(data).filter(([, info]) => {
  const lic = Array.isArray(info.licenses) ? info.licenses : [info.licenses];
  return lic.some(l => FORBIDDEN.has(l));
});

if (offenders.length) {
  console.error('\nBuild stopped - forbidden licenses detected:');
  offenders.forEach(([pkg, info]) => {
    const lic = Array.isArray(info.licenses) ? info.licenses.join(', ') : info.licenses;
    console.error(` - ${pkg}: ${lic}`);
  });
  process.exit(1);
} else {
  console.log('No AML/TCL licenses found - proceeding with build');
  process.exit(0);
}