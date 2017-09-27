const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
var ActorSystem = require('./actor_system');
var Props = require("./props")
var PersonActor = require('./person_actor');
var BytesUtils =  require('./bytes_utils')


if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs/2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  var actorSystem = new ActorSystem();

  actorSystem.init( (host,port) => {
    actorSystem.initCluster( () => {
      var fatherRef = actorSystem.actorOf(new Props(PersonActor),'father',null)
       setTimeout(function() {
        motherRef = actorSystem.remoteActorRef('127.0.0.1',7000,['mother']);
        for(var i = 0;i < 1000000;i++){
          motherRef.receive('cmd',1,fatherRef)
        }

       }, 1000);
    });

  });

}
