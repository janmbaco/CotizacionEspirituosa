package main

import (
	"flag"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/global"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/servers"
	redux "github.com/janmbaco/go-redux/core"
	"os"

	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/app"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/container"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	"github.com/janmbaco/go-infrastructure/logs"
	"github.com/janmbaco/go-infrastructure/server"
	_ "github.com/jnewmano/grpc-json-proxy/codec"
	"google.golang.org/grpc"
)

var config *global.Config
var context *global.Context
var infrastructure *app.Infrastructure
var eventsSubscriber *app.EventsSubscriber
var store redux.Store

func main() {
	var file = flag.String("configs", os.Args[0]+".configs", "Config File")
	flag.Parse()

	config = global.NewConfig(
		container.NewConfigHandler(*file),
		":8080",
		global.NewDataBaseInfo(global.Sqlite, "./new.sqlite3", "", "", "", ""),
		global.NewLogInfo(logs.Trace, logs.Trace, "./logs"),
	)

	server.NewListener(config, bootstrapper).SetProtobuf(setGrpcServer).Start()
}

func bootstrapper(setter *server.ServerSetter) {

	setLogConfiguration()

	logs.Log.Info("")
	logs.Log.Info("Start Server Application")
	logs.Log.Info("")

	context = global.NewContext(config)

	infrastructure = container.NewInfrastructure(context)

	eventsSubscriber = app.NewEventSubscriber(
		infrastructure.AbstractsInfrastructure.Events.OnRemovingSubscribe,
		infrastructure.DeliveriesInfrastructure.Events.OnRemovingSubscribe,
		infrastructure.FamiliesInfrastructure.Events.OnRemovingSubscribe,
		infrastructure.GroupsInfrastructure.Events.OnRemovingSubscribe,
		infrastructure.ProductsInfrastructure.Events.OnRemovingSubscribe,
	)

	setStore()

	eventsSubscriber.RegisterEvents(app.NewEventManager(
		store,
		infrastructure.GroupsInfrastructure.Actions,
		infrastructure.DeliveriesInfrastructure.Actions,
		infrastructure.ItemsInfrastructure.Actions,
		infrastructure.ProductsInfrastructure.Actions,
	))

	setter.ServerType = server.GRpcSever
	setter.Addr = config.Port
}

func setLogConfiguration() {
	logs.Log.SetDir(config.LogInfo.LogsDir)
	logs.Log.SetConsoleLevel(config.LogInfo.ConsoleLevel)
	logs.Log.SetFileLogLevel(config.LogInfo.FileLevel)
}

func setStore() {

	abstractsBO := redux.NewBusinessObjectBuilder(infrastructure.AbstractsInfrastructure.Entity, infrastructure.AbstractsInfrastructure.Actions.ActionsObject).
		SetActionsLogicByObject(infrastructure.AbstractsInfrastructure.Service).
		GetBusinessObject()

	deliveriesBO := redux.NewBusinessObjectBuilder(infrastructure.DeliveriesInfrastructure.Entity, infrastructure.DeliveriesInfrastructure.Actions.ActionsObject).
		SetActionsLogicByObject(infrastructure.DeliveriesInfrastructure.Service).
		GetBusinessObject()

	familiesBO := redux.NewBusinessObjectBuilder(infrastructure.FamiliesInfrastructure.Entity, infrastructure.FamiliesInfrastructure.Actions.ActionsObject).
		SetActionsLogicByObject(infrastructure.FamiliesInfrastructure.Service).
		GetBusinessObject()

	groupsBO := redux.NewBusinessObjectBuilder(infrastructure.GroupsInfrastructure.Entity, infrastructure.GroupsInfrastructure.Actions.ActionsObject).
		SetActionsLogicByObject(infrastructure.GroupsInfrastructure.Service).
		GetBusinessObject()

	itemsBO := redux.NewBusinessObjectBuilder(infrastructure.ItemsInfrastructure.Entity, infrastructure.ItemsInfrastructure.Actions.ActionsObject).
		SetActionsLogicByObject(infrastructure.ItemsInfrastructure.Service).
		GetBusinessObject()

	productsBO := redux.NewBusinessObjectBuilder(infrastructure.ProductsInfrastructure.Entity, infrastructure.ProductsInfrastructure.Actions.ActionsObject).
		SetActionsLogicByObject(infrastructure.ProductsInfrastructure.Service).
		GetBusinessObject()

	store = redux.NewStore(abstractsBO, deliveriesBO, familiesBO, groupsBO, itemsBO, productsBO)
}

func setGrpcServer(grpcServer *grpc.Server) {
	ps.RegisterAbstractServer(grpcServer, servers.NewAbstractServer(store, infrastructure.AbstractsInfrastructure.Actions, infrastructure.AbstractsInfrastructure.Entity))
	ps.RegisterDeliveryServer(grpcServer, servers.NewDeliveryServer(store, infrastructure.DeliveriesInfrastructure.Actions, infrastructure.DeliveriesInfrastructure.Entity))
	ps.RegisterFamilyServer(grpcServer, servers.NewFamilyServer(store, infrastructure.FamiliesInfrastructure.Actions, infrastructure.FamiliesInfrastructure.Entity))
	ps.RegisterGroupServer(grpcServer, servers.NewGroupServer(store, infrastructure.GroupsInfrastructure.Actions, infrastructure.GroupsInfrastructure.Entity))
	ps.RegisterItemServer(grpcServer, servers.NewItemServer(store, infrastructure.ItemsInfrastructure.Actions, infrastructure.ItemsInfrastructure.Entity))
	ps.RegisterProductServer(grpcServer, servers.NewProductServer(store, infrastructure.ProductsInfrastructure.Actions, infrastructure.ProductsInfrastructure.Entity))
}
