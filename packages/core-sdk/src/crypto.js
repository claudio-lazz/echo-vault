const crypto = require('crypto');

function deriveKey(secret) {
  if (Buffer.isBuffer(secret)) return secret;
  if (typeof secret === 'string') {
    if (secret.length >= 32) return Buffer.from(secret).subarray(0, 32);
    return crypto.createHash('sha256').update(secret).digest();
  }
  throw new Error('missing_secret');
}

function encryptBlob({ plaintext, secret }) {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: encrypted.toString('base64')
  };
}

function decryptBlob({ ciphertext, iv, tag, secret }) {
  const key = deriveKey(secret);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

module.exports = { encryptBlob, decryptBlob };
