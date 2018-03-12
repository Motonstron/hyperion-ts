module.exports = {
  hyperion: {
    address: process.env.HYPERION_ADDRESS || "192.168.0.1",
    port: process.env.HYPERION_PORT || 19444,
    priority: process.env.HYPERION_PRIORITY || 1000,
    routes: {
      info: "/hyperion-info",
      off: "/hyperion-off",
      on: "/hyperion-on",
      ping: "/hyperion-ping"
    }
  },
  server: {
    port: process.env.SERVER_PORT || 8080
  }
};
