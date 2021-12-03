package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Items
	Set(state *pb.Items, item *pb.Item) *pb.Items
	Remove(state *pb.Items, item *pb.Item) *pb.Items
	RemoveByProduct(state *pb.Items, product *pb.Product) *pb.Items
	RemoveByDelivery(state *pb.Items, delivery *pb.Delivery) *pb.Items
}

type service struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Items {
	return &pb.Items{
		Items: this.repository.Select(&pb.Item{}),
	}
}

func (this *service) Set(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		this.repository.Insert(item)
	} else {
		this.repository.Update(&pb.Item{Id: item.Id}, item)
	}
	return this.Get()
}

func (this *service) Remove(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		panic("This item not exists in the repository!")
	}

	this.repository.Delete(&pb.Item{Id: item.Id})
	return this.Get()
}

func (this *service) RemoveByProduct(state *pb.Items, product *pb.Product) *pb.Items {
	if product.Id == 0 {
		panic("This product not exists in the repository!")
	}
	this.repository.Delete(&pb.Item{ProductId: product.Id})
	return this.Get()
}

func (this *service) RemoveByDelivery(state *pb.Items, delivery *pb.Delivery) *pb.Items {
	if delivery.Id == 0 {
		panic("This product not exists in the repository!")
	}

	this.repository.Delete(&pb.Item{DeliveryId: delivery.Id})
	return this.Get()
}
