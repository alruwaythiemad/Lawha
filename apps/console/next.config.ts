import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // packages/tokens and packages/i18n ship untranspiled TS source; Next
  // transpiles them itself rather than requiring a separate build step.
  transpilePackages: ['@lawha/tokens', '@lawha/i18n'],
};

export default nextConfig;
