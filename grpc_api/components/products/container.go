package products

type Container struct {
	Actions *Actions
	Service Service
	Entity  Entity
	Events  Events
}

func newContainer(actions *Actions, service Service, entity Entity, events Events) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity, Events: events}
}
