// const Service = require('node-windows').Service;
import { Service } from 'node-windows';



const svc = new Service({
    name: "nodeBasicServer",
    description: "desccc",
    script: 'C:\\etc\\newnew\\backend\\index.js'
})

svc.on('install', function() {
    svc.start();
})
svc.install();



