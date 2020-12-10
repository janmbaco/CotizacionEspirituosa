//+build wireinject

package container

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/app"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/families"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/events"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/servers"
	"github.com/janmbaco/go-infrastructure/config"
	redux "github.com/janmbaco/go-redux/core"
)

func NewConfigHandler(file string) config.ConfigHandler {
	return config.NewFileConfigHandler(file)
}

func NewInfrastructure(ctx *app.Context) *app.Infrastructure {
	wire.Build(app.NewInfrastructure, newProductServer, newItemServer, newGroupServer, newFamilyServer, newDeliveryServer, newAbstractsSever, newEventsManager, newStore, newEventsSubscriber, products.NewProductsInfrastructure, items.NewItemsInfrastructure, groups.NewGroupsInfrastructure, families.NewFamiliesInfrastructure, deliveries.NewDeliveriesInfrastructure, abstracts.NewAbstractsInfrastructure)
	return &app.Infrastructure{}
}

func newEventsSubscriber(abstractsInfrastructure *abstracts.Infrastructure, deliveriesInfrastructure *deliveries.Infrastructure, familiesInfrastructure *families.Infrastructure, groupsInfrastructure *groups.Infrastructure, itemsInfrastructure *items.Infrastructure, productsInfrastructure *products.Infrastructure) *events.Subscriber {
	return events.NewSubscriber(abstractsInfrastructure.Events.Subscribe, deliveriesInfrastructure.Events.Subscribe, familiesInfrastructure.Events.Subscribe, groupsInfrastructure.Events.Subscribe, productsInfrastructure.Events.Subscribe)
}

func newStore(abstractsInfrastructure *abstracts.Infrastructure, deliveriesInfrastructure *deliveries.Infrastructure, familiesInfrastructure *families.Infrastructure, groupsInfrastructure *groups.Infrastructure, itemsInfrastructure *items.Infrastructure, productsInfrastructure *products.Infrastructure) redux.Store {
	abstractsBo := redux.NewBusinessObjectBuilder(abstractsInfrastructure.Entity, abstractsInfrastructure.Actions.ActionsObject).SetActionsLogicByObject(abstractsInfrastructure.Service).GetBusinessObject()
	deliveriesBo := redux.NewBusinessObjectBuilder(deliveriesInfrastructure.Entity, deliveriesInfrastructure.Actions.ActionsObject).SetActionsLogicByObject(deliveriesInfrastructure.Service).GetBusinessObject()
	familiesBo := redux.NewBusinessObjectBuilder(familiesInfrastructure.Entity, familiesInfrastructure.Actions.ActionsObject).SetActionsLogicByObject(familiesInfrastructure.Service).GetBusinessObject()
	groupsBo := redux.NewBusinessObjectBuilder(groupsInfrastructure.Entity, groupsInfrastructure.Actions.ActionsObject).SetActionsLogicByObject(groupsInfrastructure.Service).GetBusinessObject()
	itemsBo := redux.NewBusinessObjectBuilder(itemsInfrastructure.Entity, itemsInfrastructure.Actions.ActionsObject).SetActionsLogicByObject(itemsInfrastructure.Service).GetBusinessObject()
	productsBo := redux.NewBusinessObjectBuilder(productsInfrastructure.Entity, productsInfrastructure.Actions.ActionsObject).SetActionsLogicByObject(productsInfrastructure.Service).GetBusinessObject()
	return redux.NewStore(abstractsBo, deliveriesBo, familiesBo, groupsBo, itemsBo, productsBo)
}

func newEventsManager(store redux.Store, deliveriesInfrastructure *deliveries.Infrastructure, groupsInfrastructure *groups.Infrastructure, itemsInfrastructure *items.Infrastructure, productsInfrastructure *products.Infrastructure) events.Manager {
	return events.NewManager(store, groupsInfrastructure.Actions, deliveriesInfrastructure.Actions, itemsInfrastructure.Actions, productsInfrastructure.Actions)
}

func newAbstractsSever(store redux.Store, abstractsInfrastructure *abstracts.Infrastructure) *servers.AbstractServer {
	return servers.NewAbstractServer(store, abstractsInfrastructure.Actions, abstractsInfrastructure.Entity)
}

func newDeliveryServer(store redux.Store, deliveriesInfrastructure *deliveries.Infrastructure) *servers.DeliveryServer {
	return servers.NewDeliveryServer(store, deliveriesInfrastructure.Actions, deliveriesInfrastructure.Entity)
}

func newFamilyServer(store redux.Store, familiesInfrastructure *families.Infrastructure) *servers.FamilyServer {
	return servers.NewFamilyServer(store, familiesInfrastructure.Actions, familiesInfrastructure.Entity)
}

func newGroupServer(store redux.Store, groupsInfrastructure *groups.Infrastructure) *servers.GroupServer {
	return servers.NewGroupServer(store, groupsInfrastructure.Actions, groupsInfrastructure.Entity)
}

func newItemServer(store redux.Store, itemsInfrastructure *items.Infrastructure) *servers.ItemServer {
	return servers.NewItemServer(store, itemsInfrastructure.Actions, itemsInfrastructure.Entity)
}

func newProductServer(store redux.Store, productsInfrastructure *products.Infrastructure) *servers.ProductServer {
	return servers.NewProductServer(store, productsInfrastructure.Actions, productsInfrastructure.Entity)
}
