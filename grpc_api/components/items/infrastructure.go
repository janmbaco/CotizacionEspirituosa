package items

type Infrastructure struct {
	Actions *Actions
	Service Service
	Entity  Entity
}

func newInfrastructure(actions *Actions, service Service, entity Entity) *Infrastructure {
	return &Infrastructure{Actions: actions, Service: service, Entity: entity}
}
