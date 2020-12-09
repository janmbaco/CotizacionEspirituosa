package events

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type EventsActions struct {
	OnRemovingAbstract func(event func(abstract *pb.Abstract) bool)
	OnRemovingDelivery func(event func(abstract *pb.Delivery) bool)
	OnRemovingFamily   func(event func(abstract *pb.Family) bool)
	OnRemovingGroup    func(event func(abstract *pb.Group) bool)
	OnRemovingProduct  func(event func(abstract *pb.Product) bool)
}

func NewEventActions(onRemovingAbstract func(event func(abstract *pb.Abstract) bool), onRemovingDelivery func(event func(abstract *pb.Delivery) bool), onRemovingFamily func(event func(abstract *pb.Family) bool), onRemovingGroup func(event func(abstract *pb.Group) bool), onRemovingProduct func(event func(abstract *pb.Product) bool)) *EventsActions {
	return &EventsActions{OnRemovingAbstract: onRemovingAbstract, OnRemovingDelivery: onRemovingDelivery, OnRemovingFamily: onRemovingFamily, OnRemovingGroup: onRemovingGroup, OnRemovingProduct: onRemovingProduct}
}
