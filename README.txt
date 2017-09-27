## For test:

* node test_ping

* node test_pong

## To install protobuf:
protoc -I ./conf --js_out=import_style=commonjs,binary:.  conf/cluster_msg.proto
