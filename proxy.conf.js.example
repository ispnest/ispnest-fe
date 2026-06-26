/**
 * Dynamic proxy configuration for multi-tenancy.
 *
 * When accessing the frontend via a tenant subdomain (e.g., http://tenant1.localhost:4200),
 * this proxy extracts the tenant slug ('tenant1') and ensures the backend receives it
 * via both the Host header and the X-Tenant-Debug header.
 */
module.exports = {
  "/api": {
    "target": "http://localhost:9090",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "configure": (proxy, options) => {
      proxy.on("proxyReq", (proxyReq, req, res) => {
        const host = req.headers.host;
        if (host && host.includes(".")) {
          const tenant = host.split(".")[0];
          if (tenant !== "localhost" && tenant !== "www") {
            console.log(`[Proxy] Injecting tenant header: ${tenant}`);
            proxyReq.setHeader("X-Tenant-Debug", tenant);
          }
        }
      });
    }
  }
};
