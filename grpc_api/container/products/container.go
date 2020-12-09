package products

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/products"

type Container struct {
	Actions *products.Actions
	Service products.Service
	Entity  products.Entity
	Events  products.Events
}

func newContainer(actions *products.Actions, service products.Service, entity products.Entity, events products.Events) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity, Events: events}
}
