var SocketPackageHandler = require('./socket_handler')
var handler = new SocketPackageHandler();

var buf_data = Buffer.from("xinchaoabc",'utf8');
var buf_size = Buffer.alloc(4);
buf_size.writeInt16BE(buf_data.length);

var pkg1 = Buffer.alloc(10*(buf_data.length + 4));
var current_write = 0;
for(var i = 0; i< 10;i++ ){
  buf_size.copy(pkg1,current_write);
  current_write += 4;
  buf_data.copy(pkg1,current_write );
  current_write += buf_data.length;
}
var current_read = 0;
var handleFnc = function(data,start,end){
  //console.log("handleFnc-> start:"+ start+",end:"+ end+",data:"+ data);
  //console.log(data.toString("utf8",start,end));
}
var begin = new Date().getTime();
for(var i = 0;i< 1000000;i++){
  handler.handleData(pkg1,handleFnc);
}
var end = new Date().getTime();
console.log(end - begin);
// handler.handleData(pkg1.slice(current_read,current_read + buf_data.length + 7),handleFnc);
// current_read+= (buf_data.length + 7);
// handler.handleData(pkg1.slice(current_read,current_read + buf_data.length ),handleFnc);
// current_read+= (buf_data.length);
// handler.handleData(pkg1.slice(current_read,current_read + buf_data.length * 3 ),handleFnc);
// current_read+= (buf_data.length  * 3);
// handler.handleData(pkg1.slice(current_read),handleFnc);
