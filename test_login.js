const http = require('http');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Create a valid token for admin user
const token = jwt.sign(
  { id: 1, email: 'admin@pos.com', role_id: 1 },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '8h' }
);

function testProfile(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/profile',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('PROFILE RESPONSE STATUS:', res.statusCode);
      console.log('PROFILE RESPONSE BODY:', body);
    });
  });
  req.on('error', (e) => console.error(e));
  req.end();
}

testProfile(token);
