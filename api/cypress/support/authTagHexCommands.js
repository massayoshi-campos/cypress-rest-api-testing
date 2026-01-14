const crypto = require('crypto');

const algorithm = 'aes-256-gcm';

// Decrypts text using AES-256-GCM with a given passphrase, returning the decrypted value.
Cypress.Commands.add('decryptText', (encryptedText, passphrase) => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.createHash('sha256').update(passphrase).digest();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return cy.wrap(decrypted, { log: false });
});


