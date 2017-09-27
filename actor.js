var shortid = require('shortid');
var LQueue = require('linked-queue')
var ActorRef = require('./actor_ref');
var MAIL_BOX_SIZE = 100000000;
var Actor = function(){

  this.childs = {};
  this.parent = null;
  this.watchers = [];
  this.actorRef = null;
  this.sender = null;
  this.mailbox = new LQueue();
  this.waiting = false;
  this.avg_process_time = 0;

}
Actor.prototype.onMessage = function(cmd,serializableObj,sender){
  //TODO override this function
}
Actor.prototype.preStart = function(){

}
Actor.prototype.postStop = function(){

}
var construct = function (clazz,aArgs) {
  var oNew = Object.create(clazz.prototype);
  clazz.apply(oNew, aArgs);
  return oNew;
};
Actor.prototype.createChildActorRef = function(name){
  var paths = [];
  var currentPaths = this.actorRef.paths;
  for(var i in currentPaths){
    paths.push(currentPaths[i]);
  }

  paths.push(name);
  var actorRef = new ActorRef(this.actorRef.host,this.actorRef.port,this.actorRef.getSystem(),this.actorRef.getSystem().cluster_name(),paths);
  return actorRef;
}
/**
* Not override this function
*/
Actor.prototype.actorOf = function(probs,name,errorCb){

  if(!this.childs.hasOwnProperty(name)){
    if(name === '' || name == null ){
      errorCb('Actor name must not empty');
    }
    var actor = construct(probs.clazz,probs.args)
    actor.parent = this.getSelf();
    actor.actorRef = this.createChildActorRef(name);
    actor.actorRef.id = shortid.generate();
    this.childs[name] = actor;
    process.nextTick( () => {
      actor.preStart();
    });

    return actor.actorRef;
  }else{
    errorCb('Actor '+ name + ' is exist. Can not create it');
  }
}

Actor.prototype.removeChild = function(name){
  var actor = this.childs[name];
  if(actor != null){
    actor.postStop();
    delete this.childs[name];
  }
}

Actor.prototype.getName = function(){
  return this.actorRef.getName();
}
Actor.prototype.getSelf = function(){
  return this.actorRef;
}


Actor.prototype.handleMessage = function(paths,level,cmd,serializableObj,sender){
  //guardian actor level = -1 and paths does not contains it

  var child_level = level + 1;
  console.log(child_level)
  console.log(paths)

  if( paths.length > child_level ){

    var childname = paths[child_level];
    var childActor = this.childs[childname];
    if(childActor != null){
      console.log("sender: "+ sender.remote_address)
      return childActor.handleMessage(paths,child_level,cmd,serializableObj,sender);
    }else{
      return false;
    }
  }else{

    if(this.mailbox.length < MAIL_BOX_SIZE){
      this.mailbox.enqueue({
        'msg':serializableObj,
        'cmd': cmd,
        'sender': sender
      });
    }else{
      console.error("mailbox was full!!!!")
    }
    var self =  this;
    var handleMailBox = function(){
      self.waiting = false;
      self.mailbox.dequeueAll(  mail => self.onMessage(mail.cmd,mail.msg,mail.sender) );
    }
    if(!this.waiting){
      process.nextTick(handleMailBox);
      this.waiting = true;
    }

    this.onMessage(cmd,serializableObj,sender);
    return true;
  }
}

module.exports = Actor;
