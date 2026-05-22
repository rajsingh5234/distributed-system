import fs from 'fs';
import path from 'path';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const privatePem = fs.readFileSync(path.resolve('certs/private.pem'), 'utf-8');

const jwk = rsaPemToJwk(privatePem, { use: 'sig' }, 'public');

const jwks = { keys: [jwk] };

fs.writeFileSync(
  path.resolve('public/.well-known/jwks.json'),
  JSON.stringify(jwks, null, 2)
);

console.log('jwks.json written to public/.well-known/jwks.json');
