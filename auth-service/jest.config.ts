import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!tests/**', '!**/node_modules/**'],
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(jose)/)'],
};

export default config;
