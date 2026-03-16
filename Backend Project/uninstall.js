var Service = require("node-windows").Service;
var svc = new Service({
  name: "NodeJS_API",
  description: "Node JS Server API",
  script: "C:\\NotificationServer\\server.js",
});
svc.on("uninstall", function () {});

svc.uninstall();
