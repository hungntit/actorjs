var LQueue = require('linked-queue')
var queue = new LQueue();
var start = 0;
var end = 0;
var arr = [1,2,3,4,5]
queue.enqueueAll(arr);
console.log("length:"+queue.length +", first:"+queue.first()+ ", last:"+queue.last());
queue.clear();
console.log("length:"+queue.length +", first:"+queue.first()+ ", last:"+queue.last());


console.log("--------------Enqueue--------------")
start = new Date().getTime();
for(var i = 0;i< 1000000;i++){
  queue.enqueue(i+1)
//console.log("length:"+queue.length +", first:"+queue.first()+ ", last:"+queue.last());
}

end = new Date().getTime();
console.log(end - start);
console.log("length:"+queue.length +", first:"+queue.first()+ ", last:"+queue.last());

console.log("--------------ForEach--------------")
start = new Date().getTime();
queue.forEach(function(data){
  //console.log(data);
})
end = new Date().getTime();
console.log(end - start);



console.log("--------------DequeueAll--------------")
start = new Date().getTime();
// queue.dequeueAll(function(data){
//   //console.log("data: " + data + ", length:"+queue.length +", first:"+queue.first()+ ", last:"+queue.last());
// })
end = new Date().getTime();
console.log(end - start);


console.log("--------------Dequeue For--------------")
start = new Date().getTime();
for(var i = 0;i< 1000000;i++){
  var data = queue.dequeue()
  //console.log("data: " + data + ", length:"+queue.length +", first:"+queue.first()+ ", last:"+queue.last());
}
end = new Date().getTime();
console.log(end - start);
