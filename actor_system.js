const net = require('net');
var ClusterMessageUtils = require('./cluster_msg_utils');
var cluster_msg_pb = require('./cluster_msg_pb');
var HostPortUtils = require('./hostport_utils');
var Actor = require('./actor');
var ActorRef = require('./actor_ref');
var BytesUtils = require('./bytes_utils')
var SocketPackageHandler = require('./socket_handler')
var config = require('./conf/config')
var LRU = require('lru');

var JoinCluster = cluster_msg_pb.JoinCluster;
var HostPort = cluster_msg_pb.HostPort;
var RejectJoin = cluster_msg_pb.RejectJoin;
var ClusterMembers = cluster_msg_pb.ClusterMembers;
var ClusterMsgType = cluster_msg_pb.ClusterMsgType
var DataMsg = cluster_msg_pb.DataMsg;
var DataType = cluster_msg_pb.DataType;
var ActorSystem = function(){
  //on config

  //this function in config
  var onMessage = function(){

  }
  var seed_nodes = config.seed_nodes


  var clusterName = "actorjs.io"//on config
  this.cluster_name = function(){
    return clusterName;
  }
  var self = this;

  this.host = null;
  this.port = null;
  var node_ips_ranges = [
    '127.0.0.1/32',
    '192.168.1.1/16'
  ]



  /********************************************************************/
  var nodes_clients = {};

  var nodes_clients_pkg_sizes = {}
  //var actorRefCache = new LRU(5000);
  var actorRefCaches = {};
  var server = net.createServer((c) => {

    var sendClusterMembers = function(){
      var bytes = ClusterMessageUtils.serializeJsClusterMembers(Object.keys(nodes_clients));
      writeSocket(c,bytes);
    }
    var join_cluster = function(join_cluster){
      if(self.cluster_name() === join_cluster.cluster_name){
        var member = join_cluster.member;
        console.log("Client "+ member.host+":"+member.port +" want to join");
        //tell to client list members
        sendClusterMembers();
        createClient(member.host,member.port);

      }else{
        //tell to client that Reject Connection
        writeSocket(c,ClusterMessageUtils.serializeJsRejectJoin("Cluster name is invalid"));
      }
    }

    var onDataMsg = function(dataMsg){
        // console.log("onDataMsg->dataMsg:"+dataMsg);
        var data = dataMsg.data;
        if(dataMsg.data_type === DataType.BYTES){
          data = Buffer.from(dataMsg.data,'utf8');
        }
        var sender = self.remoteActorRefById(dataMsg.sender_host,dataMsg.sender_port,dataMsg.sender_id,dataMsg.sender_paths);
        self.writeLocal(dataMsg.receiver_paths,dataMsg.cmd,data,sender);
    }
    var total_msg = 0
    var start_time = new Date().getTime();
    var countMsg  = function(){
      total_msg++;
      if(total_msg === 1000000){
        var end_time = new Date().getTime();
        console.log("Receive 1M req, time:"+(end_time - start_time));
      }
    }
    var handleFnc = function(pkg,start,end){
      var msg = ClusterMessageUtils.deserializeBinaryFrom(pkg,start,end);
      // console.log("handleFnc->msg:"+msg);
      switch (msg.type) {
        case ClusterMsgType.JOIN_CLUSTER:
          join_cluster(msg);
          break;
        case ClusterMsgType.SEND_MSG:
            onDataMsg(msg);
            //countMsg();
            break;
        default:
          console.log("case default");
          console.log(msg.constructor.name);
          console.log(msg['type'])
          console.log(msg.type);
          break;
      }
    }
    var handler = new SocketPackageHandler();
    // 'connection' listener
    c.on('end', () => {
      console.log("size clients: "+Object.keys(nodes_clients).length);
      console.log('client disconnected');
    });
    c.on('data', (data) => {
      handler.handleData(data,handleFnc);
      // console.log("received "+ msg.type);
    });


  });
  server.on('error', (err) => {
    throw err;
  });



  /*******************************************************************/

  var onConnected = function(s_host,s_port,client){
    console.log('connected to server '+ HostPortUtils.host_port(s_host,s_port));
  }

  var onEndFunction = function(host,port){
    console.log('disconnected from server '+ HostPortUtils.host_port(host,port));
  }



  var onClusterMsg = function(client,msg,cb){
    switch (msg.type) {
      case ClusterMsgType.REJECT_JOIN_CLUSTER:
          var rejectJoin = msg;
          console.log("Reject join by "+HostPortUtils.host_port(client.remoteAddress,client.remotePort) +". Reason: "+ rejectJoin.reason);
          client.end();//close connection
        break;
      case ClusterMsgType.CLUSTER_MEMBERS:
        var clusterMembers = msg;
        var members = clusterMembers.members;
        for(var i in members){
          var member = members[i];
          var s_host = member.host;
          var s_port = member.port;
          createClient(s_host,s_port);
        }
        break;

      default:

    }
  }


  var createClient = function(s_host,s_port){
    var LENGTH_PKG_HEADER  = 4;//4 bytes
    if(HostPortUtils.host_port(s_host,s_port) != HostPortUtils.host_port(self.host,self.port) && !nodes_clients.hasOwnProperty(HostPortUtils.host_port(s_host,s_port))){

      var client = net.connect({host: s_host, port: s_port}, () => {});
      client.on('connect', () => {
        let client_host_post = HostPortUtils.host_port(client.remoteAddress,client.remotePort)
        nodes_clients_pkg_sizes[client_host_post] = 0;
        nodes_clients[client_host_post] = client;
        actorRefCaches[client_host_post] = new LRU(5000);
        writeSocket(client,ClusterMessageUtils.serializeJsJoinCluster(self.host,self.port,self.cluster_name()));
        onConnected(client.remoteAddress,client.remotePort,client);
      });
      var handler = new SocketPackageHandler();
      var handleFn = function(pkg,start,end){
        var msg = ClusterMessageUtils.deserializeBinaryFrom(pkg,start,end);
        onClusterMsg(client,msg,onMessage);
      }
      client.on('data', (data) => {
        handler.handleData(data,handleFn);
      });
      var onDisconnected = (client) => {
        let client_host_post = HostPortUtils.host_port(client.remoteAddress,client.remotePort)
        console.log("disconnected................from "+ client_host_post)
        delete nodes_clients_pkg_sizes[client_host_post];
        //client.pause();
        delete nodes_clients[client_host_post];
        delete actorRefCaches[client_host_post]

        onEndFunction(client.remoteAddress,client.remotePort);
        console.log("size clients: "+Object.keys(nodes_clients).length);
      }
      client.on('error',(err)=>{
        console.error(err)
        onDisconnected(client)
        client.end();
      });
      client.on('end', ()=>{
        onDisconnected(client)
      });
    }
  }
  this.initCluster = function(successCb){
    var initClients = function(){
      for(var i in seed_nodes){
        var s_host = seed_nodes[i].host;
        var s_port = seed_nodes[i].port;
        createClient(s_host,s_port);
      }
    };
      server.listen(self.port, () => {
        console.log('server bound on ' + HostPortUtils.host_port(self.host,self.port) );
        initClients();
        successCb();
      });



  }




  var initGuardianActor = function(host,port,system){
    var actor = new Actor("");
    var actorRef = new ActorRef(host,port,system,system.cluster_name(),[]);
    actor.actorRef =  actorRef;
    return actor;
  }
  var guardian = null;
  var writeSocket = function(socket,buffer){
    var sizeBuf = Buffer.alloc(2);
    sizeBuf.writeUInt16BE(buffer.length);
    socket.write(sizeBuf);
    socket.write(buffer);
  };
  this.init = function(successCb){
    HostPortUtils.generate_port(seed_nodes[0].port, (generated_port) => {
      self.port = generated_port;
      self.host = HostPortUtils.generate_host(seed_nodes[0].host);
      guardian = initGuardianActor(self.host,self.port,self);
      successCb(self.host,self.port);
    });
  }
  this.writeLocal = function(paths,cmd,obj,sender){
    return guardian.handleMessage(paths,-1,cmd,obj,sender);
  }

  this.writeRemote = function(host,port,paths,cmd,obj,sender){
    var client = nodes_clients[HostPortUtils.host_port(host,port)];
    if(client != null){
      bytesData = ClusterMessageUtils.serializeJsDataMsg(sender.host,sender.port,sender.id,sender.paths,paths,cmd,obj);
      console.log("Send to "+ HostPortUtils.host_port(host,port))
      writeSocket(client,bytesData)

      return true;
    }
    return false;
  }
  this.actorOf = function(probs,name,errorCb){
    return guardian.actorOf(probs,name,errorCb);
  }
  this.remoteActorRef = function(host,port,paths){
    var actorRef = new ActorRef(host,port,this,this.cluster_name(),paths);

    return actorRef;
  }
  this.remoteActorRefById = function(host,port,id,paths){
    var actorRef = null;

    if(id != null){
      let actorRefCache = actorRefCaches[HostPortUtils.host_port(host,port)];
      actorRef = actorRefCache ? actorRefCache.get(id) : null;
      if(actorRef ==  null){
        actorRef = new ActorRef(host,port,this,this.cluster_name(),paths);
        actorRef.id =  id;
        actorRefCache.set(id,actorRef);
      }
    }else{
      actorRef = new ActorRef(host,port,this,this.cluster_name(),paths);

    }
    return actorRef;
  }
}


ActorSystem.prototype.deserializeObject = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}
ActorSystem.prototype.serializeObject = function(obj){
  return BytesUtils.convertJsonToBytes(obj);
}

ActorSystem.prototype.write = function(host,port,paths,cmd,obj,sender){
  if(port === this.port && host === this.host ){
    return this.writeLocal(paths,cmd,obj,sender);
  }else{
    return this.writeRemote(host,port,paths,cmd,obj,sender);
  }
}



module.exports =  ActorSystem;
