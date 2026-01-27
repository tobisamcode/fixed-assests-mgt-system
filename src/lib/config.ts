export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000"),
  },

  auth: {
    enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === "true",
    secret: process.env.AUTH_SECRET || "fallback-secret-key",
    channelId: process.env.NEXT_PUBLIC_CHANNEL_ID,
    channelSecret: process.env.NEXT_PUBLIC_CHANNEL_SECRET,
  },

  services: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
    googleAnalytics: {
      id: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    },
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
    },
  },

  env: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },
} as const;

export type Config = typeof config;

export function validateEnv(): void {
  const requiredVars: string[] = [
    // 'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

if (config.env.isDevelopment) {
  validateEnv();
}
