package families

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/families"

type Container struct {
	Actions *families.Actions
	Service families.Service
	Entity  families.Entity
	Events  families.Events
}

func newContainer(actions *families.Actions, service families.Service, entity families.Entity, events families.Events) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity, Events: events}
}
