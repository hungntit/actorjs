LQueue = require('linked-queue')

var ProcessTime = function(max_size){
  this.begin = 0;
  this.max_size = max_size;
  this.process_time_queue = new LQueue();
  this.total_process_time = 0;
}
ProcessTime.prototype.start = function(){
    this.begin = new Date().getTime();
}
ProcessTime.prototype.stop = function(){
    var process_time = new Date().getTime() - this.begin;
    this.total_process_time += process_time;
    this.process_time_queue.enqueue(process_time);
    if(this.process_time_queue.length > this.max_size){
      this.total_process_time -= this.process_time_queue.dequeue();
    }
}
ProcessTime.prototype.avg_process_time = function(){
    return this.total_process_time/this.process_time_queue;
}
