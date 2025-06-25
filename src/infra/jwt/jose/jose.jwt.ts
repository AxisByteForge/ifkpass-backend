import { jwtVerify, createRemoteJWKSet } from 'jose';

import { Config } from '../../env/get-env';

const config = new Config();

const baseUrl = config.get('COGNITO_URL');
const userPoolId = config.get('COGNITO_USER_POOL_ID');
const clientId = config.get('COGNITO_CLIENT_ID');

const JWKS = createRemoteJWKSet(
  new URL(`${baseUrl}/${userPoolId}/.well-known/jwks.json`),
);

export async function verifyToken(authHeader?: string): Promise<string> {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Ivalid token');
    }

    const token = authHeader.replace('Bearer ', '');

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${baseUrl}/${userPoolId}`,
      audience: clientId,
    });

    return payload.sub ?? '';
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error(String(err));
  }
}
