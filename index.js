var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ip = require('ip');

var hostport_sockets = {};
var socketid_hostport{};
var seed_nodes = [
  {
    'host':'127.0.0.1',
    'port':'7000',
  },{
    'host':'127.0.0.1',
    'port':'7001',
  },

];
function validateIPaddress(ipaddress)  {
 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    return (true)
 }
 return (false)
}

var generate_host = function(seed_node_ip){
  if(validateIPaddress(seed_node_ip)){
    //if domain, return domain, but now return ip
    return ip.address();
  }else{
    if(seed_node_ip === '127.0.0.1' || seed_node_ip === 'localhost'){
      return seed_node_ip;
    }else{
      return ip.address();
    }
  }
}
var generate_port = function(seed_node_port){
    return 7000;
}
var host = generate_host(seed_nodes[0]['host']);
var port = generate_port(seed_nodes[0]['host']);
var node_ips_ranges = {
  '127.0.0.1/32',
  '192.168.1.1/16'
}


var host_port = function(host,port){
  return host+":"+port;
}
var ws_hostport = function(host,port){
  return "http://"+host_port(host,port)
}

var client = require('socket.io-client');


var sockets = {};
for(var i in seed_nodes){
  if(hostport(seed_nodes[i]['host'],seed_nodes[i]['port'] != host_port(host,port)){
    var socket = client.connect(ws_hostport(seed_nodes[i]['host'],seed_nodes[i]['port']), { reconnect: true });//connection to seed_nodes
    sockets[seed_nodes[i]] = socket;
    var join_data = {
      'host':host,
      'port':port,
      'roles':[],
      'node_token':'input_token_here_and_descript_to_avoid_hack'
    }
    socket.emit('join_cluster',join_data())
  }
}

app.get('/', function(req, res){
  res.sendfile('index.html');
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  socket.on('disconnect', function(){
        console.log( socket.name + ' has disconnected from the chat.' + socket.id);
  });
  socket.on('join_cluster',function(join_obj){
    
  });
});
http.listen(port, function(){
  console.log('listening on *:'+port);
});
