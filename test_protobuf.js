var ClusterMessageUtils = require('./cluster_msg_utils');
var clusterMessages = require('./cluster_msg_pb');
var JoinCluster = clusterMessages.JoinCluster;
var HostPort = clusterMessages.HostPort;
var RejectJoin = clusterMessages.RejectJoin;
var ClusterMembers = clusterMessages.ClusterMembers;
var ClusterMsgType = clusterMessages.ClusterMsgType
var DataMsg = clusterMessages.DataMsg

var begin = new Date().getTime();
for(var i = 0; i < 1000000;i++){
  var dataBuffer = Buffer.alloc(4);
  dataBuffer.writeInt32BE(1);
  var buffer = ClusterMessageUtils.serializePbDataMsg('127.0.0.1',9000,['father'],'mother',4,new Uint8Array(dataBuffer));
  var msg = DataMsg.deserializeBinary(buffer);
}

var end = new Date().getTime();
console.log(end - begin);

 begin = new Date().getTime();
 var obj = {
   "sender_path": '127.0.0.1',
   "sender_port": 9000,
   "sender_paths": ['father'],
   "receiver_paths":['mother'],
   "data": 1,
   "data_type": 4
 }
for(var i = 0; i < 1000000;i++){
  var str = JSON.stringify(obj);
  var buffer = Buffer.from(str,'utf8');
  JSON.parse(buffer.toString('utf8'));
}

 end = new Date().getTime();
console.log(end - begin);
