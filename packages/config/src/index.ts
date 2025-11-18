export type Environment = 'development' | 'preview' | 'production';

export interface AppConfig {
  name: string;
  environment: Environment;
}

export const appConfig: AppConfig = {
  name: 'Monorepo Workspace',
  environment: (process.env.APP_ENV as Environment) ?? 'development'
};

export default appConfig;
