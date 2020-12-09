package items

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/items"

type Container struct {
	Actions *items.Actions
	Service items.Service
	Entity  items.Entity
}

func newContainer(actions *items.Actions, service items.Service, entity items.Entity) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity}
}
