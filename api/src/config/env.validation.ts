import * as Joi from 'joi';

export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SSL: boolean;
}

const environmentSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),
});

let cachedEnvironment: EnvironmentVariables | undefined;

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validationResult = environmentSchema.validate(config, {
    abortEarly: true,
    allowUnknown: true,
    convert: true,
  });

  if (validationResult.error) {
    throw new Error(
      `Environment validation error: ${validationResult.error.message}`,
    );
  }

  return validationResult.value;
}

export function getValidatedEnvironment(): EnvironmentVariables {
  if (!cachedEnvironment) {
    cachedEnvironment = validateEnvironment(process.env);
  }

  return cachedEnvironment;
}
