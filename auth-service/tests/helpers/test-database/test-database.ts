export interface ITestDatabaseStrategy {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  cleanup(): Promise<void>;
}

export class TestDatabase {
  constructor(private strategy: ITestDatabaseStrategy) {}

  setup() {
    return this.strategy.connect();
  }

  teardown() {
    return this.strategy.disconnect();
  }

  cleanup() {
    return this.strategy.cleanup();
  }
}
