/** @type {import('next').NextConfig} */
const webpackConfig = {
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default webpackConfig;
