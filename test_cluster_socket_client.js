const net = require('net');
var recevestr = "";
const client = net.connect({port: 8124}, (server_socket) => {
  //'connect' listener
  console.log('connected to server!');
  for(var i =0;i< 5000000; i++){
    client.write('world!sdjaflkdjslkajsdklfjkldajdslkfjlaslkjsdafkljklasjjsdalkfj');
  }
});
client.on('data', (data) => {
  recevestr += data.toString();
  console.log("[data from server:"+data.toString()+"]");
  console.log(recevestr);
  //client.end();
});

client.on('end', () => {

  console.log('disconnected from server');
});
