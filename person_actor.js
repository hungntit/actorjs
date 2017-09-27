var Actor = require('./actor')
var Props = require('./props')
var PersonActor = function(){
  this.mydarling = null;
  this.totalmsg = 0 ;
  this.startTime = new Date().getTime();
  this.showlog = false;
}

PersonActor.prototype = new Actor();
PersonActor.prototype.onMessage = function(cmd,serializableObj,sender){
  this.totalmsg ++;
  if(this.totalmsg %10000000 == 0){
    var handleTime  = new Date().getTime() - this.startTime;
    console.log("Handle Time:"+handleTime);
    console.log(this.getName() + "->Total msg: "  + this.totalmsg);
  }
  //1. marry, 2: agree, 3: make love, 4. fregnant, 5. born child, 6.born 7. talksth
  switch (serializableObj) {
    case 1:
      if(this.showlog)
      console.log(this.getName() + ":" +sender.getName()+" want marry me");
      this.mydarling = sender;
      sender.receive('cmd',2,this.actorRef);

      break;
    case 2:
      if(this.showlog){
        console.log(this.getName() + ":" +sender.getName()+" aggree");
        console.log(this.getName() + ":" + "Hi " +sender.getName()+"I want to make love with you.");
      }

      this.mydarling = sender;

      sender.receive('cmd',3,this.actorRef);
      break;
    case 3:
      if(this.showlog)
      console.log(this.getName() + ":" +sender.getName()+" want to make love with me.");
      this.actorRef.receive('cmd',4,null);
      break;
    case 4:
      if(this.showlog)
      console.log(this.getName() + ": I have fregnant");
      //var childActor = this.actorOf(new Props(PersonActor),'child'+ ++this.totalchild ,null);
      //childActor.receive('cmd',6,this.actorRef);
      this.mydarling.receive('cmd',5,this.actorRef);
      break;
    case 5:
      if(this.showlog)
      console.log(this.getName() + ": I'm so happy, I'm a dad!");
      break;
    case 6:

      break;

    default:

  }

}
module.exports  = PersonActor;
