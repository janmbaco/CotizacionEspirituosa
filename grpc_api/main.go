package main

import (
	"flag"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/families"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/global"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/servers"
	redux "github.com/janmbaco/go-redux/src"
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
	var file = flag.String("configs", os.Args[0]+".config", "Config File")
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

	abstractsParam := redux.NewBusinessParamBuilder(infrastructure.AbstractsInfrastructure.Service.Get(), infrastructure.AbstractsInfrastructure.Actions).
		SetSelector(abstracts.Selector).
		SetActionsLogicByObject(infrastructure.AbstractsInfrastructure.Service).
		GetBusinessParam()

	deliveriesParam := redux.NewBusinessParamBuilder(infrastructure.DeliveriesInfrastructure.Service.Get(), infrastructure.DeliveriesInfrastructure.Actions).
		SetSelector(deliveries.Selector).
		SetActionsLogicByObject(infrastructure.DeliveriesInfrastructure.Service).
		GetBusinessParam()

	familiesParam := redux.NewBusinessParamBuilder(infrastructure.FamiliesInfrastructure.Service.Get(), infrastructure.FamiliesInfrastructure.Actions).
		SetSelector(families.Selector).
		SetActionsLogicByObject(infrastructure.FamiliesInfrastructure.Service).
		GetBusinessParam()

	groupsParam := redux.NewBusinessParamBuilder(infrastructure.GroupsInfrastructure.Service.Get(), infrastructure.GroupsInfrastructure.Actions).
		SetSelector(groups.Selector).
		SetActionsLogicByObject(infrastructure.GroupsInfrastructure.Service).
		GetBusinessParam()

	itemsParam := redux.NewBusinessParamBuilder(infrastructure.ItemsInfrastructure.Service.Get(), infrastructure.ItemsInfrastructure.Actions).
		SetSelector(items.Selector).
		SetActionsLogicByObject(infrastructure.ItemsInfrastructure.Service).
		GetBusinessParam()

	productsParam := redux.NewBusinessParamBuilder(infrastructure.ProductsInfrastructure.Service.Get(), infrastructure.ProductsInfrastructure.Actions).
		SetSelector(products.Selector).
		SetActionsLogicByObject(infrastructure.ProductsInfrastructure.Service).
		GetBusinessParam()

	store = redux.NewStore(abstractsParam, deliveriesParam, familiesParam, groupsParam, itemsParam, productsParam)
}

func setGrpcServer(grpcServer *grpc.Server) {
	ps.RegisterAbstractServer(grpcServer, servers.NewAbstractServer(store, infrastructure.AbstractsInfrastructure.Actions))
	ps.RegisterDeliveryServer(grpcServer, servers.NewDeliveryServer(store, infrastructure.DeliveriesInfrastructure.Actions))
	ps.RegisterFamilyServer(grpcServer, servers.NewFamilyServer(store, infrastructure.FamiliesInfrastructure.Actions))
	ps.RegisterGroupServer(grpcServer, servers.NewGroupServer(store, infrastructure.GroupsInfrastructure.Actions))
	ps.RegisterItemServer(grpcServer, servers.NewItemServer(store, infrastructure.ItemsInfrastructure.Actions))
	ps.RegisterProductServer(grpcServer, servers.NewProductServer(store, infrastructure.ProductsInfrastructure.Actions))
	ps.RegisterStatusServer(grpcServer, &servers.StatusService{})
}
