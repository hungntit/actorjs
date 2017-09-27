var start = new Date().getTime()
var arr = []
for(var i = 0;i< 1000000; i++){
  arr.push(i);

}
var end = new Date().getTime()
console.log(end - start)

 start = new Date().getTime()
for(var i = 0;i< 1000000; i++){
  arr.pop();

}
 end = new Date().getTime()
console.log(end - start)
 start = new Date().getTime()
for(var i = 0;i< 1000000; i++){
    setImmediate(function(){

    });
}
 end = new Date().getTime()
 console.log(end - start)
