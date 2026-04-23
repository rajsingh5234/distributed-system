import { Config } from './config';

function greet(name: string): string {
  return `Hello from auth-service, ${name}!`;
}

console.log(greet('distributed system'));
console.log('Server running on port:', Config.PORT);
