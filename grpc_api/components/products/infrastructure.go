package products

type Infrastructure struct {
	Actions *Actions
	Service Service
	Events  Events
}

func newInfrastructure(actions *Actions, service Service, events Events) *Infrastructure {
	return &Infrastructure{Actions: actions, Service: service, Events: events}
}
