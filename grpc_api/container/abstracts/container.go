package abstracts

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/state/abstracts"

type Container struct {
	Actions *abstracts.Actions
	Service abstracts.Service
	Entity  abstracts.Entity
	Events  abstracts.Events
}

func newContainer(actions *abstracts.Actions, service abstracts.Service, entity abstracts.Entity, events abstracts.Events) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity, Events: events}
}
