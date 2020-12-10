package items

type Container struct {
	Actions *Actions
	Service Service
	Entity  Entity
}

func newContainer(actions *Actions, service Service, entity Entity) *Container {
	return &Container{Actions: actions, Service: service, Entity: entity}
}
