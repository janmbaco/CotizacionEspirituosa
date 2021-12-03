package items

type Infrastructure struct {
	Actions *Actions
	Service Service
}

func newInfrastructure(actions *Actions, service Service) *Infrastructure {
	return &Infrastructure{Actions: actions, Service: service}
}
