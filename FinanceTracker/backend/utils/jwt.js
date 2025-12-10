const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'change_this_secret';

function sign(payload, opts = {}) {
  return jwt.sign(payload, secret, Object.assign({ expiresIn: '7d' }, opts));
}

function verify(token) {
  return jwt.verify(token, secret);
}

module.exports = { sign, verify };
