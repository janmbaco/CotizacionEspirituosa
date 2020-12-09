package groups

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/groups"

type Container struct {
	Actions *groups.Actions
	Service groups.Service
	Entity  groups.Entity
	Events  groups.Events
}

func newContainer(actions *groups.Actions, service groups.Service, entity groups.Entity, events groups.Events) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity, Events: events}
}
