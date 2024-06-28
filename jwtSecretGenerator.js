const crypto = require('crypto');

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = generateJwtSecret;
