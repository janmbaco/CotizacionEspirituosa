package products

type Entity struct {
	service Service
}

func NewEntity(service Service) *Entity {
	return &Entity{service: service}
}

func (e *Entity) GetInitialState() interface{} {
	return e.service.Get()
}
