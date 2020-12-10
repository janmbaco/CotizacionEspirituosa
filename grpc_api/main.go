package main

import (
	"flag"
	app2 "github.com/janmbaco/CotizacionEspirituosa/grpc_api/app"
	"os"

	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/configs"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/container"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	"github.com/janmbaco/go-infrastructure/logs"
	"github.com/janmbaco/go-infrastructure/server"
	_ "github.com/jnewmano/grpc-json-proxy/codec"
	"google.golang.org/grpc"
)

func main() {
	var file = flag.String("configs", os.Args[0]+".configs", "Config File")
	flag.Parse()

	config := configs.NewConfig(
		container.NewConfigHandler(*file),
		"8080",
		configs.NewDataBaseInfo(configs.Sqlite, "./new.db", "", "", "", ""),
		configs.NewLogInfo(logs.Info, logs.Error, "./logs"))

	ctx := app2.NewContext(config)

	app := container.NewInfrastructure(ctx)

	app.EventsSubscriber.Initialize(app.EventManager)

	server.NewListener(config, func(serverSetter *server.ServerSetter) {
		serverSetter.ServerType = server.GRpcSever
		serverSetter.Addr = config.Port
	}).SetProtobuf(func(grpcServer *grpc.Server) {
		ps.RegisterAbstractServer(grpcServer, app.AbstractServer)
		ps.RegisterDeliveryServer(grpcServer, app.DeliveryServer)
		ps.RegisterFamilyServer(grpcServer, app.FamiliesServer)
		ps.RegisterGroupServer(grpcServer, app.GroupServer)
		ps.RegisterItemServer(grpcServer, app.ItemServer)
		ps.RegisterProductServer(grpcServer, app.ProductServer)

	}).Start()
}
