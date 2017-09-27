
var ActorSystem = require('./actor_system');
var Props = require("./props")
var PersonActor = require('./person_actor');
var BytesUtils =  require('./bytes_utils')
var actorSystem = new ActorSystem();
var test  = function(){
  console.log(BytesUtils.convertNumberToDataType(-255353.933));
}
test();
var a = new Date().getTime() * 1000;
actorSystem.init( (host,port) => {
  actorSystem.initCluster( () => {
    var fatherRef = actorSystem.actorOf(new Props(PersonActor),'father',null)
     setTimeout(function() {
      motherRef = actorSystem.remoteActorRef('127.0.0.1',7002,['mother']);
      for(var i = 0;i < 1000000;i++){
        motherRef.receive('cmd',1,fatherRef)
      }

     }, 1000);
  });

});
