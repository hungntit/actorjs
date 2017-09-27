var text = "abcdefghjklm"
var t1 = new Date().getTime();
for(var i = 0; i < 1000000;i++){
  if(text === "abcdefghjklm"){

  }
}
var t2 = new Date().getTime();
console.log(t2 -t1);

 t1 = new Date().getTime();
for(var i = 0; i < 1000000000;i++){
  if(i+1 === i + 1){

  }
}
 t2 = new Date().getTime();
console.log(t2 -t1);
