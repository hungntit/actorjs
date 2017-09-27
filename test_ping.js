
var ActorSystem = require('./actor_system');
var Props = require("./props")
var PingActor = require('./ping_actor');
var BytesUtils =  require('./bytes_utils')
var actorSystem = new ActorSystem();

actorSystem.init( (host,port) => {
  actorSystem.initCluster( () => {
    var pingActor = actorSystem.actorOf(new Props(PingActor),'ping',null)
  });

});
