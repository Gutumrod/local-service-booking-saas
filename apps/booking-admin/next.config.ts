import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ponytail: dev-only tunnel access for remote testing; trycloudflare.com
  // hostnames rotate every run, so this stays a wildcard rather than a fixed host.
  allowedDevOrigins: ['*.trycloudflare.com'],
};

export default nextConfig;
