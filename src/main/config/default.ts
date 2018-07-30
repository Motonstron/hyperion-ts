module.exports = {
  hyperion: {
    address: process.env.HYPERION_ADDRESS || "192.168.86.110",
    port: process.env.HYPERION_PORT || 19444,
    priority: process.env.HYPERION_PRIORITY || 1,
    routes: {
      info: "/hyperion-info",
      off: "/hyperion-off",
      on: "/hyperion-on",
      status: "/hyperion-status"
    }
  },
  server: {
    port: process.env.SERVER_PORT || 8090
  }
};
