export interface IDbConnection {
  connect(): Promise<void>;
}
