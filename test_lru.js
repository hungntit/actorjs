var LRU = require('lru');

var cache = new LRU(2000)
var begin = new Date().getTime();
for(var i =0;i< 1000000;i++){
  cache.set(i%2500,i);
}
console.log(cache.length)
var end = new Date().getTime();
console.log(end- begin);
