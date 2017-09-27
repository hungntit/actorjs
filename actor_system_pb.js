const net = require('net');
var ClusterMessageUtils = require('./cluster_msg_utils');
var cluster_msg_pb = require('./cluster_msg_pb');
var HostPortUtils = require('./hostport_utils');
var Actor = require('./actor');
var ActorRef = require('./actor_ref');
var BytesUtils = require('./bytes_utils')

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
  var seed_nodes = [
    {
      'host': '127.0.0.1',
      'port': 7000,
    },{
      'host': '127.0.0.1',
      'port': 7001,
    },

  ];


  var clusterName = "mingle.io"//on config
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
  var server = net.createServer((c) => {
    var sendClusterMembers = function(){
      c.write(ClusterMessageUtils.serializePbClusterMembers(Object.keys(nodes_clients)));
    }
    var join_cluster = function(bytes){
      var join_cluster = JoinCluster.deserializeBinary(bytes);
      if(self.cluster_name() === join_cluster.getClusterName()){
        var member = join_cluster.getMember();
        console.log("Client "+ member.getHost()+":"+member.getPort() +" want to join");
        //tell to client list members
        sendClusterMembers();
        createClient(member.getHost(),member.getPort());

      }else{
        //tell to client that Reject Connection

        c.write(ClusterMessageUtils.serializePbRejectJoin("Cluster name is invalid"));
      }
    }
    var onDataMsg = function(bytes){
        var dataMsg = DataMsg.deserializeBinary(bytes);
        var dataBuf = new Buffer(dataMsg.getData());
        var data = null;
        switch (dataMsg.getDataType()) {
          case DataType.STRING:
            data = dataBuf.toString('utf8');
            break;
          case DataType.INT_32:
            data =   dataBuf.readInt32BE(0);
            break;
          case DataType.INT_64:
            data = BytesUtils.readInt64(dataBuf,0);
            break;
          case DataType.FLOAT:
              data =   dataBuf.readFloatBE(0);
              break;
          case DataType.DOUBLE:
              data =   dataBuf.readDoubleBE(0);
              break;
          case DataType.OBJECT:
              data = self.deserializeObject(dataBuf);
            break;
          default:

        }
        var sender = self.remoteActorRef(dataMsg.getSenderHost(),dataMsg.getSenderPort(),dataMsg.getSenderPathsList())
        self.writeLocal(dataMsg.getReceiverPathsList(),data,sender);
    }
    // 'connection' listener
    c.on('end', () => {
      console.log('client disconnected');
    });
    c.on('drain', () => {
      console.log('client drain. buffer is empty');
    });
    c.on('data', (data) => {
      var bytes = new Uint8Array(data);
      console.log("received "+ bytes[1]);
      switch (bytes[1]) {
        case ClusterMsgType.JOIN_CLUSTER:
          join_cluster(bytes);
          break;
        case ClusterMsgType.SEND_MSG:
            onDataMsg(bytes);
            break;
        default:
          console.log()
          console.log(data);
      }
    });
    //c.write('hello');
    //c.pipe(c);

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



  var onClusterMsg = function(client,bytes,cb){
    switch (bytes[1]) {
      case ClusterMsgType.REJECT_JOIN_CLUSTER:
          var rejectJoin = RejectJoin.deserializeBinary(bytes);
          console.log("Reject join by "+HostPortUtils.host_port(client.remoteAddress,client.remotePort) +". Reason: "+ rejectJoin.getReason());
          client.end();//close connection
        break;
      case ClusterMsgType.CLUSTER_MEMBERS:
        var clusterMembers = ClusterMembers.deserializeBinary(bytes);
        var members = clusterMembers.getMembersList();
        for(var i in members){
          var member = members[i];
          var s_host = member.getHost();
          var s_port = member.getPort();
          createClient(s_host,s_port);

        }
        break;

      default:

    }
  }

  var MAX_INT_32 = Math.pow(2,31) -1;
  var MIN_INT_32 = -Math.pow(2,31);

  var MIN_FLOAT =  Math.pow(2,-149);
  var MAX_FLOAT = (2- Math.pow(2,-23)) * Math.pow(2,127);
  var convertNumberToDataType = function(number){
    var data = null;
    var dataType = null;
    var floorInt = Math.floor(number);
    if(floorInt === number){

      if(floorInt <= MAX_INT_32 && floorInt >= MIN_INT_32){
          dataType = DataType.INT_32;
          data = BytesUtils.convertInt32ToBytes(number);
      }else{
        dataType = DataType.INT_64;
        data = BytesUtils.convertInt64ToBytes(number);
      }
    }else{
      if(floorInt <= MAX_FLOAT && floorInt >= MIN_FLOAT){
        dataType = DataType.FLOAT;
        data = BytesUtils.convertFloatToBytes(number);
      }else{
          dataType = DataType.DOUBLE;
          data = BytesUtils.convertDoubleToBytes(number);
      }
    }
    return {"type": dataType, "data": data};
  }
  var createClient = function(s_host,s_port){
    if(HostPortUtils.host_port(s_host,s_port) != HostPortUtils.host_port(self.host,self.port) && !nodes_clients.hasOwnProperty(HostPortUtils.host_port(s_host,s_port))){
      var client = net.connect({host: s_host, port: s_port}, () => {
      });
      client.on('connect', () => {
        nodes_clients[HostPortUtils.host_port(client.remoteAddress,client.remotePort)] = client;
        client.write(ClusterMessageUtils.serializePbJoinCluster(self.host,self.port,self.cluster_name()));
        onConnected(client.remoteAddress,client.remotePort,client);
      });
      client.on('data', (data) => {
        var bytes = new Uint8Array(data);
        onClusterMsg(client,bytes,onMessage);
      });
      client.on('error',(err)=>{
        client.end();
      });
      client.on('end', ()=>{
        delete nodes_clients[HostPortUtils.host_port(client.remoteAddress,client.remotePort)];
        onEndFunction(client.remoteAddress,client.remotePort);
        //console.log("size clients: "+Object.keys(nodes_clients).length);
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

  this.init = function(successCb){
    HostPortUtils.generate_port(seed_nodes[0].port, (generated_port) => {
      self.port = generated_port;
      self.host = HostPortUtils.generate_host(seed_nodes[0].host);
      guardian = initGuardianActor(self.host,self.port,self);
      successCb(self.host,self.port);
    });
  }
  this.writeLocal = function(paths,cmd,serializableObj,sender){
    return guardian.handleMessage(paths,-1,cmd,serializableObj,sender);
  }

  this.writeRemote = function(host,port,paths,cmd,obj,sender){
    var client = nodes_clients[HostPortUtils.host_port(host,port)];
    if(client != null){
      var dataType = null;
      var data = null;
      if(typeof obj === 'string'){
        dataType = DataType.STRING;
        data = Buffer.from(obj,'utf8');
      }else if(typeof obj === 'number'){
        var valueObj = convertNumberToDataType(obj);
        dataType = valueObj.type;
        data = valueObj.data;
      }else {
          dataType = DataType.OBJECT;
          data = this.serializeObject(obj);
      }
      bytesData = ClusterMessageUtils.serializePbDataMsg(this.host,this.port,sender.paths,paths,dataType,data);

      client.write(bytesData);
      return true;
    }
    return false;
  }
  this.actorOf = function(probs,name,errorCb){
    return guardian.actorOf(probs,name,errorCb);
  }

}


ActorSystem.prototype.deserializeObject = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}
ActorSystem.prototype.serializeObject = function(obj){
  return BytesUtils.convertJsonToBytes(obj);
}
ActorSystem.prototype.remoteActorRef = function(host,port,paths){
  var actorRef = new ActorRef(host,port,this,this.cluster_name(),paths);
  return actorRef;
}

ActorSystem.prototype.write = function(host,port,paths,cmd,obj,sender){

  if(port === this.port && host === this.host ){
    return this.writeLocal(paths,cmd,obj,sender);
  }else{
    return this.writeRemote(host,port,paths,cmd,obj,sender);
  }
}



module.exports =  ActorSystem;
