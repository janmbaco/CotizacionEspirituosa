package events

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type Subscriber struct {
	OnRemovingAbstract func(event func(abstract *pb.Abstract) bool)
	OnRemovingDelivery func(event func(abstract *pb.Delivery) bool)
	OnRemovingFamily   func(event func(abstract *pb.Family) bool)
	OnRemovingGroup    func(event func(abstract *pb.Group) bool)
	OnRemovingProduct  func(event func(abstract *pb.Product) bool)
}

func NewSubscriber(onRemovingAbstract func(event func(abstract *pb.Abstract) bool), onRemovingDelivery func(event func(abstract *pb.Delivery) bool), onRemovingFamily func(event func(abstract *pb.Family) bool), onRemovingGroup func(event func(abstract *pb.Group) bool), onRemovingProduct func(event func(abstract *pb.Product) bool)) *Subscriber {
	return &Subscriber{OnRemovingAbstract: onRemovingAbstract, OnRemovingDelivery: onRemovingDelivery, OnRemovingFamily: onRemovingFamily, OnRemovingGroup: onRemovingGroup, OnRemovingProduct: onRemovingProduct}
}

func (this *Subscriber) Initialize(manager Manager) {
	this.OnRemovingAbstract(manager.OnRemovingAbstract)
	this.OnRemovingDelivery(manager.OnRemovingDelivery)
	this.OnRemovingFamily(manager.OnRemovingFamily)
	this.OnRemovingGroup(manager.OnRemovingGroup)
	this.OnRemovingProduct(manager.OnRemovingProduct)
}
