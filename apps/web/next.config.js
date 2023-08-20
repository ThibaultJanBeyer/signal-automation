const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = async (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    ...defaultConfig,
    reactStrictMode: true,

    experimental: {
      serverActions: true,
      instrumentationHook: true,
    },
    transpilePackages: ["@sa/ui"],
    images: {
      unoptimized: true,
    },
  };
  return withBundleAnalyzer(nextConfig);
};
