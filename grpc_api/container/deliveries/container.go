package deliveries

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/deliveries"
)

type Container struct {
	Actions *deliveries.Actions
	Service deliveries.Service
	Entity  deliveries.Entity
	Events  deliveries.Events
}

func newContainer(actions *deliveries.Actions, service deliveries.Service, entity deliveries.Entity, events deliveries.Events) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity, Events: events}
}
