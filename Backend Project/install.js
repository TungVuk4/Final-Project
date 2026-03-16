var Service = require('node-windows').Service;
var svc = new Service({
    name: 'NodeJS_APITramDomua',
    description: 'Node JS Server API',
    script: 'C:\\NotificationServer\\server.js'
})
svc.on('install', function () {
    svc.start()
})

svc.install();
