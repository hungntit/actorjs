var clusterMessages = require('./cluster_msg_pb');
var JoinCluster = clusterMessages.JoinCluster;
var HostPort = clusterMessages.HostPort;
var RejectJoin = clusterMessages.RejectJoin;
var ClusterMembers = clusterMessages.ClusterMembers;
var ClusterMsgType = clusterMessages.ClusterMsgType
var DataMsg = clusterMessages.DataMsg
var DataType = clusterMessages.DataType;

function ClusterMessageUtils(){
}


ClusterMessageUtils.createPbJoinCluster = function(host,port,cluster_name){
  var msg = new JoinCluster();
  msg.setType(ClusterMsgType.JOIN_CLUSTER);
  var member = new HostPort();
  member.setHost(host);
  member.setPort(port);
  msg.setMember(member);
  msg.setClusterName(cluster_name);
  return msg;
}


ClusterMessageUtils.serializePbJoinCluster = function(host,port,cluster_name){
  var msg = ClusterMessageUtils.createPbJoinCluster(host,port,cluster_name);
  return new Buffer(msg.serializeBinary().buffer);
}



ClusterMessageUtils.createPbDataMsg = function(sender_host,sender_port,sender_paths,receiver_paths,data_type,data){
  var msg = new DataMsg();
  msg.setType(ClusterMsgType.SEND_MSG);
  msg.setSenderHost(sender_host);
  msg.setSenderPort(sender_port);
  msg.setSenderPathsList(sender_paths);
  msg.setReceiverPathsList(receiver_paths);
  msg.setDataType(data_type);
  msg.setData(new Uint8Array(data));
  return msg;
}

ClusterMessageUtils.serializePbDataMsg = function(sender_host,sender_port,sender_paths,receiver_paths,data_type,data){
  var msg = ClusterMessageUtils.createPbDataMsg(sender_host,sender_port,sender_paths,receiver_paths,data_type,data)
  return new Buffer(msg.serializeBinary().buffer);
}


ClusterMessageUtils.createPbRejectJoin = function(reason){
  var msg = new RejectJoin();
  msg.setType(ClusterMsgType.REJECT_JOIN_CLUSTER);
  msg.setReason(reason);
  return msg;
}
ClusterMessageUtils.serializePbRejectJoin = function(reason){
  var msg = ClusterMessageUtils.createPbRejectJoin(reason);
  return new Buffer(msg.serializeBinary().buffer);
}


ClusterMessageUtils.createPbClusterMembers = function(member_strs){
  var msg = new ClusterMembers();
  msg.setType(ClusterMsgType.CLUSTER_MEMBERS);
  var members = msg.getMembersList();
  for(var i in member_strs){
    host_port_strs = member_strs[i].split(':',2);
    var hostport = new HostPort();
    hostport.setHost(host_port_strs[0]);
    hostport.setPort(parseInt(host_port_strs[1]));
    members.push(hostport);
  }
  return msg;
}
ClusterMessageUtils.serializePbClusterMembers = function(member_strs){
  var msg = ClusterMessageUtils.createPbClusterMembers(member_strs);
  return new Buffer(msg.serializeBinary().buffer);
}

ClusterMessageUtils.createJsJoinCluster = function(host,port,cluster_name){
  return {
    "type":ClusterMsgType.JOIN_CLUSTER,
    "member": {
      "host":host,
      "port":port,
    },
    "cluster_name":cluster_name
  }
}


ClusterMessageUtils.serializeJsJoinCluster = function(host,port,cluster_name){
  var msg = ClusterMessageUtils.createJsJoinCluster(host,port,cluster_name);
  return  Buffer.from(JSON.stringify(msg),"utf8");
}
ClusterMessageUtils.deserializeJsJoinCluster = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}


ClusterMessageUtils.createJsDataMsg = function(sender_host,sender_port,sender_id,sender_paths,receiver_paths,cmd,data){
  var data_type = null;
  var serialized_data = data;
  if(data != null && data.constructor.name === "Buffer"){
    data_type =  DataType.BYTES;
    serialized_data = data.toString("utf8");
  }

  return  {
    "type":ClusterMsgType.SEND_MSG,
    "sender_host": sender_host,
    "sender_port": sender_port,
    "sender_id": sender_id,
    "sender_paths" : sender_paths,
    "receiver_paths" : receiver_paths,
    "cmd": cmd,
    "data_type":data_type,
    "data" : data
  }
}

ClusterMessageUtils.serializeJsDataMsg = function(sender_host,sender_port,sender_id,sender_paths,receiver_paths,cmd,data){
  var msg = ClusterMessageUtils.createJsDataMsg(sender_host,sender_port,sender_id,sender_paths,receiver_paths,cmd,data)
  return  Buffer.from(JSON.stringify(msg),"utf8");
}
ClusterMessageUtils.deserializeJsDataMsg = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}

ClusterMessageUtils.createJsRejectJoin = function(reason){
  return {
    "type":ClusterMsgType.REJECT_JOIN_CLUSTER,
    "reason": reason
  }
}
ClusterMessageUtils.serializeJsRejectJoin = function(reason){
  var msg = ClusterMessageUtils.createJsRejectJoin(reason);
  // console.log("serializeJsRejectJoin->msg:"+msg);
  return  Buffer.from(JSON.stringify(msg),"utf8");
}
ClusterMessageUtils.deserializeJsRejectJoin = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}


ClusterMessageUtils.createJsClusterMembers = function(member_strs){
  var members = []
  for(var i in member_strs){
    host_port_strs = member_strs[i].split(':',2);
    var hostport = {
      "host": host_port_strs[0],
      "port":parseInt(host_port_strs[1])
    }
    members.push(hostport);
  }
  return {
    "type": ClusterMsgType.CLUSTER_MEMBERS,
    "members": members
  }
}
ClusterMessageUtils.serializeJsClusterMembers = function(member_strs){
  var msg = ClusterMessageUtils.createJsClusterMembers(member_strs);
  return  Buffer.from(JSON.stringify(msg),"utf8");
}
ClusterMessageUtils.deserializeJsClusterMembers = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}
ClusterMessageUtils.deserializeBinary = function(buffer){
  return JSON.parse(buffer.toString('utf8'));
}
ClusterMessageUtils.deserializeBinaryFrom = function(buffer,offet,end){
  var msg =buffer.toString('utf8',offet,end);
  return JSON.parse(msg);
}
module.exports = ClusterMessageUtils;
