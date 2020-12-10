package container

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/events"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/servers"
)

type Container struct {
	EventsSubscriber *events.Subscriber
	EventManager     events.Manager
	AbstractServer   *servers.AbstractServer
	DeliveryServer   *servers.DeliveryServer
	FamiliesServer   *servers.FamilyServer
	GroupServer      *servers.GroupServer
	ItemServer       *servers.ItemServer
	ProductServer    *servers.ProductServer
}

func newContainer(eventsActions *events.Subscriber, eventManager events.Manager, abstractServer *servers.AbstractServer, deliveryServer *servers.DeliveryServer, familiesServer *servers.FamilyServer, groupServer *servers.GroupServer, itemServer *servers.ItemServer, productServer *servers.ProductServer) *Container {
	return &Container{EventsSubscriber: eventsActions, EventManager: eventManager, AbstractServer: abstractServer, DeliveryServer: deliveryServer, FamiliesServer: familiesServer, GroupServer: groupServer, ItemServer: itemServer, ProductServer: productServer}
}
