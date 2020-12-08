package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Deliveries
	OnNewState(deliveries *pb.Deliveries)
}

type entity struct {
	service Service
	current *pb.Deliveries
	isBusy  chan bool
}

func NewEntity(service Service) *entity {
	return &entity{service: service, isBusy: make(chan bool, 1)}
}

func (e *entity) GetInitialState() interface{} {
	return e.service.Get()
}

func (e *entity) GetCurrentState() *pb.Deliveries {
	e.isBusy <- true
	current := &pb.Deliveries{}
	_ = copier.Copy(current, e.current)
	<-e.isBusy
	return current
}

func (e *entity) OnNewState(deliveries *pb.Deliveries) {
	e.isBusy <- true
	e.current = deliveries
	<-e.isBusy
}
