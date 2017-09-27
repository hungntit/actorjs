const net = require('net');
const server = net.createServer((c) => {
  var total = 0;
  var start = new Date().getTime();
  // 'connection' listener
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });
  c.on('data', (data) => {
    total ++;
    if(total %100000 == 0){
      console.log(total);
      console.log("Time:"+ (new Date().getTime() - start));
    }
  });
  //c.write('hello');
  //c.pipe(c);

});
server.on('error', (err) => {
  throw err;
});

server.listen(8124, () => {
  console.log('server bound');
});
