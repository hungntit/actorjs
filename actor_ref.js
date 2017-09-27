var ActorRef = function(host,port,_system,_cluster_name,_paths){
  this.system = _system;

  this.host = host;
  this.port = port;
  this.id = null;
  this.paths = _paths;
  var path = this.paths.join('/');
  this.local_address = 'actor://' + _cluster_name + '/' + path
  this.remote_address = 'actor://' + _cluster_name + '@' + host + ':' + port + '/' + path
  delete path;
  this.getName = function(){
    return this.paths[this.paths.length - 1];
  }
}
ActorRef.prototype.getSystem  = function(){
  return this.system;
}
ActorRef.prototype.receive = function(cmd,serializableObj,sender) {
  return this.system.write(this.host,this.port,this.paths,cmd,serializableObj,sender);
}
module.exports = ActorRef;
