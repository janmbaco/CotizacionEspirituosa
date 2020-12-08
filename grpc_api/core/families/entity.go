package families

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Families
	OnNewState(families *pb.Families)
}

type entity struct {
	service Service
	current *pb.Families
	isBusy  chan bool
}

func NewEntity(service Service) *entity {
	return &entity{service: service, isBusy: make(chan bool, 1)}
}

func (e *entity) GetInitialState() interface{} {
	return e.service.Get()
}

func (e *entity) GetCurrentState() *pb.Families {
	e.isBusy <- true
	current := &pb.Families{}
	_ = copier.Copy(current, e.current)
	<-e.isBusy
	return current
}

func (e *entity) OnNewState(families *pb.Families) {
	e.isBusy <- true
	e.current = families
	<-e.isBusy
}
