package main

import (
	"flag"
	"google.golang.org/grpc"
	"os"

	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/impls"
	"github.com/janmbaco/go-infrastructure/config"
	"github.com/janmbaco/go-infrastructure/server"
    _ "github.com/jnewmano/grpc-json-proxy/codec"
)

type Config struct {
	Version string `json:"version"`
	Port    string `json:"port"`
}

func main() {
	var configfile = flag.String("config", os.Args[0]+".config", "Config File")
	flag.Parse()
	configHandler := config.NewFileConfigHandler(*configfile)
	conf := &Config{Version: "0.0.0", Port: ":8080"}
	configHandler.Load(conf)

	server.NewListener(configHandler, func(serverSetter *server.ServerSetter) {
		serverSetter.ServerType = server.GRpcSever
		serverSetter.Addr = conf.Port
	}).SetProtobuf(func(grpcServer *grpc.Server) {
		ps.RegisterStatusServiceServer(grpcServer, &impls.StatusService{})
	}).Start()
}
