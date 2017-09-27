const cp = require('child_process');
const child = cp.fork(`${__dirname}/test_process_child.js`,['abc']);

total = 0;
var start = new Date().getTime();
child.on('message', (m) => {
  total ++;
  if(total % 100000 == 0){
    console.log(total);
    console.log("Time:"+ (new Date().getTime() - start));
  }

});
child.send("hello");
