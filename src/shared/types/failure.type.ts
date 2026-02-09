export interface Failure {
  reason: string;
  statusCode: number;
}

export const createFailure = (reason: string, statusCode: number): Failure => ({
  reason,
  statusCode
});
