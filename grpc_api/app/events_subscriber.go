package app

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type EventsSubscriber struct {
	OnRemovingAbstractSubscribeFunc func(event func(abstract *pb.Abstract) bool)
	OnRemovingDeliverySubscribeFunc func(event func(abstract *pb.Delivery) bool)
	OnRemovingFamilySubscribeFunc   func(event func(abstract *pb.Family) bool)
	OnRemovingGroupSubscribeFunc    func(event func(abstract *pb.Group) bool)
	OnRemovingProductSubscribeFunc  func(event func(abstract *pb.Product) bool)
}

func NewEventSubscriber(onRemovingAbstractSubscribeFunc func(event func(abstract *pb.Abstract) bool), onRemovingDeliverySubscribeFunc func(event func(abstract *pb.Delivery) bool), onRemovingFamilySubscribeFunc func(event func(abstract *pb.Family) bool), onRemovingGroupSubscribeFunc func(event func(abstract *pb.Group) bool), onRemovingProductSubscribeFunc func(event func(abstract *pb.Product) bool)) *EventsSubscriber {
	return &EventsSubscriber{OnRemovingAbstractSubscribeFunc: onRemovingAbstractSubscribeFunc, OnRemovingDeliverySubscribeFunc: onRemovingDeliverySubscribeFunc, OnRemovingFamilySubscribeFunc: onRemovingFamilySubscribeFunc, OnRemovingGroupSubscribeFunc: onRemovingGroupSubscribeFunc, OnRemovingProductSubscribeFunc: onRemovingProductSubscribeFunc}
}

func (this *EventsSubscriber) RegisterEvents(eventsManager EventsManager) {
	this.OnRemovingAbstractSubscribeFunc(eventsManager.OnRemovingAbstract)
	this.OnRemovingDeliverySubscribeFunc(eventsManager.OnRemovingDelivery)
	this.OnRemovingFamilySubscribeFunc(eventsManager.OnRemovingFamily)
	this.OnRemovingGroupSubscribeFunc(eventsManager.OnRemovingGroup)
	this.OnRemovingProductSubscribeFunc(eventsManager.OnRemovingProduct)
}
