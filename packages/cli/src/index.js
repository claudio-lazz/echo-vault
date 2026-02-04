#!/usr/bin/env node

const cmd = process.argv[2];

if (!cmd) {
  console.log('echovault <init|grant|request>');
  process.exit(0);
}

if (cmd === 'init') {
  console.log('init vault (stub)');
} else if (cmd === 'grant') {
  console.log('grant access (stub)');
} else if (cmd === 'request') {
  console.log('request context (stub)');
} else {
  console.log('unknown command');
}
