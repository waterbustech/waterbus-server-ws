protoc --js_out=import_style=commonjs,binary:. ./protos/auth.proto 
protoc --proto_path=./protos --grpc_out=grpc_js:./protos --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` ./protos/auth.proto
protoc --plugin=protoc-gen-ts=node_modules/.bin/protoc-gen-ts --ts_out=. ./protos/auth.proto  

protoc --js_out=import_style=commonjs,binary:. ./protos/meeting.proto 
protoc --proto_path=./protos --grpc_out=grpc_js:./protos --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` ./protos/meeting.proto
protoc --plugin=protoc-gen-ts=node_modules/.bin/protoc-gen-ts --ts_out=. ./protos/meeting.proto 