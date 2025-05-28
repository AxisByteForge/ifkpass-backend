// npx ts-node scripts/seed-admin-table.ts

import 'dotenv/config';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { handler } from '../src/admin/adapters/handlers/create-admin';

const filePath = path.resolve(
  __dirname,
  '../.vscode/payloads/admins.seed.jsonl',
);

async function run() {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    console.log('📦 Lendo linha:', line);

    const { body } = JSON.parse(line);

    const event: APIGatewayProxyEvent = {
      body,
      headers: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/admin',
      pathParameters: null,
      queryStringParameters: null,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      requestContext: {} as any,
      resource: '/admin',
      stageVariables: null,
    };

    try {
      const result = await handler(event);
      console.log('✅ Cadastrado:', JSON.parse(body).email, result);
    } catch (error) {
      console.error('❌ Erro ao cadastrar:', JSON.parse(body).email, error);
    }
  }
}

run();
