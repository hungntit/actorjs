
var ActorSystem = require('./actor_system');
var Props = require("./props")
var PingActor = require('./ping_actor');
var BytesUtils =  require('./bytes_utils')
var actorSystem = new ActorSystem();

actorSystem.init( (host,port) => {
  actorSystem.initCluster( () => {
    var pongActor = actorSystem.actorOf(new Props(PingActor),'pong',null)
     setTimeout(function() {
      pingRef = actorSystem.remoteActorRef('127.0.0.1',7000,['ping']);
      for(var i = 0;i < 1;i++){
        pingRef.receive('cmd',1,pongActor)
      }

     }, 1000);
  });

});
