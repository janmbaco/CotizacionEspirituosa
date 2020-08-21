package main

import (
	"flag"
	"google.golang.org/grpc"
	"os"

	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services/grpc_services"
	"github.com/janmbaco/go-infrastructure/config"
	"github.com/janmbaco/go-infrastructure/server"
)

type Config struct {
	Version string `json:"version"`
	Port    string `json:"port"`
}

func main() {
	var configfile = flag.String("config", os.Args[0]+".config", "Config File")
	flag.Parse()
	configHandler := config.NewFileConfigHandler(*configfile)
	conf := &Config{Version: "0.0.0", Port: "80"}
	configHandler.Load(conf)

	server.NewListener(configHandler, func(serverSetter *server.ServerSetter) {
		serverSetter.ServerType = server.GRpcSever
		serverSetter.Addr = conf.Port
	}).SetProtobuf(func(grpcServer *grpc.Server) {
		grpc_services.RegisterStatusServiceServer(grpcServer, &services.StatusService{})
	}).Start()
}
