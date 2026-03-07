import * as dotenv from 'dotenv';

dotenv.config({ override: true });

function requireEnvVariable(envVariable: string): string {
  const enVariableValue = process.env[envVariable];
  if (enVariableValue === undefined) {
    throw new Error(`Env variable ${envVariable} is not set`);
  }

  return enVariableValue;
}

export const BASE_URL = requireEnvVariable('BASE_URL');
export const USER_EMAIL = requireEnvVariable('USER_EMAIL');
export const USER_NAME = requireEnvVariable('USER_NAME');
export const USER_PASSWORD = requireEnvVariable('USER_PASSWORD');
export const AVATAR = requireEnvVariable('AVATAR');
