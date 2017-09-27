
var ActorSystem = require('./actor_system');
var Props = require("./props")
var PersonActor = require('./person_actor');
var BytesUtils =  require('./bytes_utils')
var actorSystem = new ActorSystem();

var a = new Date().getTime() * 1000;
actorSystem.init( (host,port) => {
  actorSystem.initCluster( () => {
    var fatherRef = actorSystem.actorOf(new Props(PersonActor),'father',null)
    var motherRef1 = actorSystem.actorOf(new Props(PersonActor),'mother1',null)
    for(var i = 0;i < 1;i++){
      motherRef1.receive('cmd',1,fatherRef);
    }
    var motherRef = actorSystem.actorOf(new Props(PersonActor),'mother',null)
  });

});
// setTimeout(function() {
//
// }, 1000);
