package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Groups
	OnNewState(abstracts *pb.Groups)
}

type entity struct {
	service   Service
	publisher events2.Publisher
	current   *pb.Groups
	isBusy    chan bool
}

func NewEntity(service Service, publisher events2.Publisher) *entity {
	return &entity{service: service, publisher: publisher, isBusy: make(chan bool, 1)}
}

func (e *entity) GetInitialState() interface{} {
	return e.service.Get()
}

func (e *entity) GetCurrentState() *pb.Groups {
	e.isBusy <- true
	current := &pb.Groups{}
	_ = copier.Copy(current, e.current)
	<-e.isBusy
	return current
}

func (e *entity) OnNewState(abstracts *pb.Groups) {
	e.isBusy <- true
	e.current = abstracts
	<-e.isBusy
}
