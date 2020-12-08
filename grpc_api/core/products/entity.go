package products

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/copier"
)

type Entity interface {
	GetInitialState() interface{}
	GetCurrentState() *pb.Products
	OnNewState(products *pb.Products)
}

type entity struct {
	service Service
	current *pb.Products
	isBusy  chan bool
}

func NewEntity(service Service) *entity {
	return &entity{service: service, isBusy: make(chan bool, 1)}
}

func (e *entity) GetInitialState() interface{} {
	return e.service.Get()
}

func (e *entity) GetCurrentState() *pb.Products {
	e.isBusy <- true
	current := &pb.Products{}
	_ = copier.Copy(current, e.current)
	<-e.isBusy
	return current
}

func (e *entity) OnNewState(products *pb.Products) {
	e.isBusy <- true
	e.current = products
	<-e.isBusy
}
