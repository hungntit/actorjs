var BytesUtils  = function(){

}
var cluster_msg_pb = require('./cluster_msg_pb');
var DataType = cluster_msg_pb.DataType;
var MAX_INT_32 = Math.pow(2,31) -1;
var MIN_INT_32 = -Math.pow(2,31);

var MIN_FLOAT =  Math.pow(2,-149);
var MAX_FLOAT = (2- Math.pow(2,-23)) * Math.pow(2,127);
BytesUtils.writeInt64  = function(buffer,num,offset){
  var long = num;
   for ( var index = 0; index < 8; index ++ ) {
       var byte = long & 0xff;
       buffer[offset + index ] = byte;
       long = (long - byte) / 256 ;
   }

}
BytesUtils.convertInt64ToBytes = function(num){
  var buffer  = Buffer.allocUnsafe(8);
  BytesUtils.writeInt64(buffer,num,0) ;
  return buffer;
}
BytesUtils.convertInt32ToBytes = function(num){
  var buffer  = Buffer.allocUnsafe(4);
  var written = buffer.writeInt32BE(num,0);
  return buffer;
}
BytesUtils.convertFloatToBytes = function(num){
  var buffer  = Buffer.allocUnsafe(4);
  buffer.writeFloatBE(num,0);
  return buffer;
}
BytesUtils.convertDoubleToBytes = function(num){
  var buffer  = Buffer.allocUnsafe(8);
  buffer.writeDoubleBE(num,0);
  return buffer;
}
BytesUtils.convertJsonToBytes = function(obj){
  return Buffer.from(JSON.stringify(obj),'utf8');
}
BytesUtils.readInt64 = function(buffer,offset) {
  var value = 0;
  for ( var i = offset + 7; i >= 0; i--) {
      value = (value * 256) + buffer[i];
  }
  return value;
}

BytesUtils.convertNumberToDataType = function(number){
  var data = null;
  var dataType = null;
  var floorInt = Math.floor(number);
  if(floorInt === number){
    if(floorInt <= MAX_INT_32 && floorInt >= MIN_INT_32){
        dataType = DataType.INT_32;
        data = BytesUtils.convertInt32ToBytes(number);
    }else{
      dataType = DataType.INT_64;
      data = BytesUtils.convertInt64ToBytes(number);
    }
  }else{
    if(floorInt <= MAX_FLOAT && floorInt >= MIN_FLOAT){
      dataType = DataType.FLOAT;
      data = BytesUtils.convertFloatToBytes(number);
    }else{
        dataType = DataType.DOUBLE;
        data = BytesUtils.convertDoubleToBytes(number);
    }
  }
  return {"type": dataType, "data": data};
}
module.exports = BytesUtils;
