var SocketPackageHandler = function(){
  this.buffer_size = 0;
  this.current_read_buffer = 0;
  this.buf  = Buffer.alloc(65536);
  this.buf_header = Buffer.alloc(2);
  this.remain_header = 0;
}
var LENGTH_PKG_HEADER  = 2;//4 bytes
SocketPackageHandler.prototype.handleData = function(data,handlePackageFn){
  var current_read = 0;
  var remain_data = data.length - current_read;
  while(remain_data > 0){
    if(this.remain_header > 0 ){
      var copied = data.copy(this.buf_header,LENGTH_PKG_HEADER - this.remain_header,current_read,current_read + this.remain_header);
      current_read += copied;
      this.current_read_buffer += copied;
      this.remain_header = this.remain_header - copied;
      if(this.remain_header == 0){
        this.buffer_size = this.buf_header.readInt16BE(0) + LENGTH_PKG_HEADER;
      }
    }else if(this.buffer_size === 0){
      if(remain_data >= LENGTH_PKG_HEADER){
        this.buffer_size = data.readInt16BE(current_read) + LENGTH_PKG_HEADER;
        this.current_read_buffer += LENGTH_PKG_HEADER;
        current_read += LENGTH_PKG_HEADER;
      }else{
        this.remain_header = LENGTH_PKG_HEADER
        var copied = data.copy(this.buf_header,LENGTH_PKG_HEADER - this.remain_header,current_read);
        current_read += copied;
        this.current_read_buffer += copied;
        this.remain_header = this.remain_header - copied;
      }


    }else { //if(this.buffer_size > 0)
      var remain_buffer = this.buffer_size - this.current_read_buffer;
      if(remain_data >= remain_buffer ){ //can read all
        if(this.current_read_buffer === LENGTH_PKG_HEADER){
          handlePackageFn(data,current_read,current_read + remain_buffer);
        }else{// can read all, copy to buf and handle
          var copied = data.copy(this.buf,this.current_read_buffer,current_read,current_read + remain_buffer);
          //current_read += copied;
          //this.current_read_buffer += copied;
          handlePackageFn(this.buf,LENGTH_PKG_HEADER, this.buffer_size);
        }
        //this.current_read_buffer += remain_buffer;
        current_read += remain_buffer;
        this.buffer_size = 0;
        this.current_read_buffer = 0;
      }else{// can not read all, add to buf
        var copied = data.copy(this.buf,this.current_read_buffer,current_read,current_read + remain_data);
        current_read += copied;
        this.current_read_buffer += copied;
      }
    }
    remain_data = data.length - current_read;
  }
}
module.exports = SocketPackageHandler;
