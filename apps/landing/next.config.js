/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Transpile monorepo packages
  transpilePackages: ['@procrastinact/ui'],
};

export default nextConfig;
