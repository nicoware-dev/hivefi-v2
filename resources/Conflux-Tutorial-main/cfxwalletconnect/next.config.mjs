/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // swcMinify: true,
    experimental: { urlImports: ["https://cdn.jsdelivr.net"] },
    images :{
      domains :["avatars.githubusercontent.com","confluxnetwork.org"]
    }
};

export default nextConfig;
