package main

import (
	"flag"
	"google.golang.org/grpc"
	"os"

	"github.com/janmbaco/go-infrastructure/config"
	"github.com/janmbaco/go-infrastructure/server"
)

type Config struct{
	version string `json:"version"`
	port string `json:"port"`
}

func main(){
	var configfile = flag.String("config", os.Args[0]+".config", "Config File")
	flag.Parse()
	configHandler := config.NewFileConfigHandler(*configfile)
	conf := &Config{ version: "0.0.0", port: "80"}
	configHandler.Load(conf)

	server.NewListener(configHandler, func(serverSetter *server.ServerSetter){
		serverSetter.ServerType = server.GRpcSever
		serverSetter.Addr = conf.port
	}).SetProtobuf(func(grpcServer *grpc.Server){
		grpcServer.RegisterService()
	}).Start()
}
