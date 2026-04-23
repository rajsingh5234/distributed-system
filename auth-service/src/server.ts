function greet(name: string): string {
  return `Hello from auth-service, ${name}!`;
}

console.log(greet('distributed system'))
console.log('testing hook blocking')
console.log('another log')

