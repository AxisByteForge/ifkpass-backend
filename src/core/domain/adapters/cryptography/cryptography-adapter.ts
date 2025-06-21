export interface CryptographyAdapter {
  hash(plain: string): Promise<string>;
  compare(dbPassword: string, loginPassword: string): Promise<boolean>;
}
