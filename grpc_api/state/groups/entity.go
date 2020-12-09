package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Groups
	OnNewState(groups *pb.Groups)
}

type entity struct {
	service Service
	current *pb.Groups
	isBusy  chan bool
}

func NewEntity(service Service) Entity {
	return &entity{service: service, isBusy: make(chan bool, 1)}
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

func (e *entity) OnNewState(groups *pb.Groups) {
	e.isBusy <- true
	e.current = groups
	<-e.isBusy
}
