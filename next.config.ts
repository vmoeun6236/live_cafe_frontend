import type { NextConfig } from "next";
import os from "os";

// Dynamically resolve local active LAN IP address for development
const getLocalIP = (): string => {
  // First, try to extract the active LAN IP from the environment API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const match = apiUrl.match(/https?:\/\/([^\/:]+)/);
  if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
    return match[1];
  }

  // Fallback to network interfaces, ignoring virtual/WSL interfaces
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const lowerName = name.toLowerCase();
          if (
            lowerName.includes('wsl') || 
            lowerName.includes('virtual') || 
            lowerName.includes('vbox') || 
            lowerName.includes('host-only') || 
            iface.address.startsWith('169.254.')
          ) {
            continue;
          }
          return iface.address;
        }
      }
    }
  }
  return '127.0.0.1';
};

const localIP = getLocalIP();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: localIP,
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: localIP,
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "pos_app_backend.test",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development',
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "localhost:3000",
    "127.0.0.1:3000",
    "pos_app_backend.test",
    localIP,
    `${localIP}:3000`,
    `http://${localIP}:3000`
  ],
};

export default nextConfig;
