package abstracts

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
	events2 "github.com/janmbaco/go-infrastructure/events"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Abstracts
	OnNewState(abstracts *pb.Abstracts)
}

type entity struct {
	service   Service
	publisher events2.Publisher
	current   *pb.Abstracts
	isBusy    chan bool
}

func NewEntity(service Service, publisher events2.Publisher) *entity {
	return &entity{service: service, publisher: publisher, isBusy: make(chan bool, 1)}
}

func (e *entity) GetInitialState() interface{} {
	return e.service.Get()
}

func (e *entity) GetCurrentState() *pb.Abstracts {
	e.isBusy <- true
	current := &pb.Abstracts{}
	_ = copier.Copy(current, e.current)
	<-e.isBusy
	return current
}

func (e *entity) OnNewState(abstracts *pb.Abstracts) {
	e.isBusy <- true
	e.current = abstracts
	<-e.isBusy
}
