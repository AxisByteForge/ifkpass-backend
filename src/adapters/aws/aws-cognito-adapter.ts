export interface IdentityProviderServiceAdapter {
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<string>;
  confirmEmail(email: string, code: string): Promise<void>;
  isEmailVerified(email: string): Promise<any>;
}
