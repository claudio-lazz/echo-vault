#!/usr/bin/env node

const { encryptBlob } = require('../packages/core-sdk/src/crypto');

const secret = process.env.ECHOVAULT_SECRET || 'dev-secret';
const payload = process.argv[2] || JSON.stringify({ hello: 'world' });

const encrypted = encryptBlob({ plaintext: payload, secret });
console.log(JSON.stringify(encrypted, null, 2));
