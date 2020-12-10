//+build wireinject

package container

import (
	"github.com/google/wire"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/abstracts"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/deliveries"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/families"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/groups"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/items"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/components/products"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/events"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/servers"
	redux "github.com/janmbaco/go-redux/core"
)

func NewContainer(ctx *context.Context) *Container {
	wire.Build(newContainer, newProductServer, newItemServer, newGroupServer, newFamilyServer, newDeliveryServer, newAbstractsSever, newEventsManager, newStore, newEventsSubscriber, products.NewProductsContainer, items.NewItemsContainer, groups.NewGroupsContainer, families.NewFamiliesContainer, deliveries.NewDeliveriesContainer, abstracts.NewAbstractsContainer)
	return &Container{}
}

func newEventsSubscriber(abstractsContainer *abstracts.Container, deliveriesContainer *deliveries.Container, familiesContainer *families.Container, groupsContainer *groups.Container, itemsContainer *items.Container, productsContainer *products.Container) *events.Subscriber {
	return events.NewSubscriber(abstractsContainer.Events.Subscribe, deliveriesContainer.Events.Subscribe, familiesContainer.Events.Subscribe, groupsContainer.Events.Subscribe, productsContainer.Events.Subscribe)
}

func newStore(abstractsContainer *abstracts.Container, deliveriesContainer *deliveries.Container, familiesContainer *families.Container, groupsContainer *groups.Container, itemsContainer *items.Container, productsContainer *products.Container) redux.Store {
	abstractsBo := redux.NewBusinessObjectBuilder(abstractsContainer.Entity, abstractsContainer.Actions.ActionsObject).SetActionsLogicByObject(abstractsContainer.Service).GetBusinessObject()
	deliveriesBo := redux.NewBusinessObjectBuilder(deliveriesContainer.Entity, deliveriesContainer.Actions.ActionsObject).SetActionsLogicByObject(deliveriesContainer.Service).GetBusinessObject()
	familiesBo := redux.NewBusinessObjectBuilder(familiesContainer.Entity, familiesContainer.Actions.ActionsObject).SetActionsLogicByObject(familiesContainer.Service).GetBusinessObject()
	groupsBo := redux.NewBusinessObjectBuilder(groupsContainer.Entity, groupsContainer.Actions.ActionsObject).SetActionsLogicByObject(groupsContainer.Service).GetBusinessObject()
	itemsBo := redux.NewBusinessObjectBuilder(itemsContainer.Entity, itemsContainer.Actions.ActionsObject).SetActionsLogicByObject(itemsContainer.Service).GetBusinessObject()
	productsBo := redux.NewBusinessObjectBuilder(productsContainer.Entity, productsContainer.Actions.ActionsObject).SetActionsLogicByObject(productsContainer.Service).GetBusinessObject()
	return redux.NewStore(abstractsBo, deliveriesBo, familiesBo, groupsBo, itemsBo, productsBo)
}

func newEventsManager(store redux.Store, deliveriesContainer *deliveries.Container, groupsContainer *groups.Container, itemsContainer *items.Container, productsContainer *products.Container) events.Manager {
	return events.NewManager(store, groupsContainer.Actions, deliveriesContainer.Actions, itemsContainer.Actions, productsContainer.Actions)
}

func newAbstractsSever(store redux.Store, abstractsContainer *abstracts.Container) *servers.AbstractServer {
	return servers.NewAbstractServer(store, abstractsContainer.Actions, abstractsContainer.Entity)
}

func newDeliveryServer(store redux.Store, deliveriesContainer *deliveries.Container) *servers.DeliveryServer {
	return servers.NewDeliveryServer(store, deliveriesContainer.Actions, deliveriesContainer.Entity)
}

func newFamilyServer(store redux.Store, familiesContainer *families.Container) *servers.FamilyServer {
	return servers.NewFamilyServer(store, familiesContainer.Actions, familiesContainer.Entity)
}

func newGroupServer(store redux.Store, groupsContainer *groups.Container) *servers.GroupServer {
	return servers.NewGroupServer(store, groupsContainer.Actions, groupsContainer.Entity)
}

func newItemServer(store redux.Store, itemsContainer *items.Container) *servers.ItemServer {
	return servers.NewItemServer(store, itemsContainer.Actions, itemsContainer.Entity)
}

func newProductServer(store redux.Store, productsContainer *products.Container) *servers.ProductServer {
	return servers.NewProductServer(store, productsContainer.Actions, productsContainer.Entity)
}
