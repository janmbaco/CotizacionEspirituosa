package products

type Infrastructure struct {
	Actions *Actions
	Service Service
	Entity  Entity
	Events  Events
}

func newInfrastructure(actions *Actions, service Service, entity Entity, events Events) *Infrastructure {
	return &Infrastructure{Actions: actions, Service: service, Entity: entity, Events: events}
}
