const ip = require('ip');
const net = require('net');

var HostPortUtils = function(){

}
HostPortUtils.generate_port = function(port,cb) {
  var server = net.createServer();
  server.listen(port, function (err) {
    server.once('close', function () {
      cb(port);
    });
    server.close();
  });
  server.on('error', function (err) {
    HostPortUtils.generate_port(port +1, cb);
  });
}

HostPortUtils.validateIPaddress = function(ipaddress)  {
 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    return true;
 }
 return false
}

HostPortUtils.generate_host = function(seed_node_ip){
  if(!HostPortUtils.validateIPaddress(seed_node_ip)){
    if(seed_node_ip === '127.0.0.1' || seed_node_ip === 'localhost'){
      return seed_node_ip;
    }
    return ip.address();
  }else{
    if(seed_node_ip === '127.0.0.1' || seed_node_ip === 'localhost'){
      return seed_node_ip;
    }else{
      return ip.address();
    }
  }
}

HostPortUtils.host_port = function(host,port){
  return host+":"+port;
}
module.exports = HostPortUtils;
