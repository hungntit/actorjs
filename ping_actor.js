var Actor = require('./actor')
var Props = require('./props')
var PingActor = function(){
  this.totalmsg = 0 ;
  this.startTime = new Date().getTime();
  this.showlog = true;
}

PingActor.prototype = new Actor();
PingActor.prototype.onMessage = function(cmd,serializableObj,sender){
  this.totalmsg ++;
  if(this.totalmsg %100 == 0){
    var handleTime  = new Date().getTime() - this.startTime;
    console.log("Handle Time:"+handleTime);
    console.log("Total child:"+ this.totalmsg);
  }
  //1. marry, 2: agree, 3: make love, 4. fregnant, 5. born child, 6.born 7. talksth
  switch (serializableObj) {
    case 1:
      if(this.showlog)
      console.log(this.getName() + ":" +sender.getName()+" pong");
      sender.receive('cmd',2,this.actorRef);

      break;
    case 2:
      if(this.showlog)
        console.log(this.getName() + ":" +sender.getName()+" ping");
      if(this.totalmsg < 1000000)
      sender.receive('cmd',1,this.actorRef);
      break;

    default:

  }

}
module.exports  = PingActor;
