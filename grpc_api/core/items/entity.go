package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Items
	OnNewState(items *pb.Items)
}

type entity struct {
	service Service
	current *pb.Items
	isBusy  chan bool
}

func NewEntity(service Service) *entity {
	return &entity{service: service, isBusy: make(chan bool, 1)}
}

func (e *entity) GetInitialState() interface{} {
	return e.service.Get()
}

func (e *entity) GetCurrentState() *pb.Items {
	e.isBusy <- true
	current := &pb.Items{}
	_ = copier.Copy(current, e.current)
	<-e.isBusy
	return current
}

func (e *entity) OnNewState(items *pb.Items) {
	e.isBusy <- true
	e.current = items
	<-e.isBusy
}
