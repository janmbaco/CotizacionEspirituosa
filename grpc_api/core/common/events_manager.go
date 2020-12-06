package common

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	redux "github.com/janmbaco/go-redux/core"
)

type EventsManager interface {
	OnRemovingAbstract(abstract *pb.Abstract)
	OnRemovingGroup(group *pb.Group)
	OnRemovingDelivery(delivery *pb.Delivery)
	OnRemovingFamily(family *pb.Family)
	OnRemovingProduct(product *pb.Product)
}

type eventsManager struct {
	store redux.Store
}

func (e eventsManager) OnRemovingAbstract(abstract *pb.Abstract) {
	panic("implement me")
}

func (e eventsManager) OnRemovingGroup(group *pb.Group) {
	panic("implement me")
}

func (e eventsManager) OnRemovingDelivery(delivery *pb.Delivery) {
	panic("implement me")
}

func (e eventsManager) OnRemovingFamily(family *pb.Family) {
	panic("implement me")
}

func (e eventsManager) OnRemovingProduct(product *pb.Product) {
	panic("implement me")
}
