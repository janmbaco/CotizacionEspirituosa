package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Items
	Set(state *pb.Items, item *pb.Item) *pb.Item
	Remove(state *pb.Items, item *pb.Item) *pb.Items
	RemoveByProduct(state *pb.Items, product *pb.Product) *pb.Items
	RemoveByDelivery(state *pb.Items, delivery *pb.Delivery) *pb.Items
}

type service struct {
	repository Repository
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Items {
	return &pb.Items{
		Items: this.repository.Select(&pb.Item{}),
	}
}

func (this *service) Set(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		item = this.repository.Insert(item)
		state.Items = append(state.Items, item)
	} else {
		state = newState(state, this.repository.Update(&pb.Item{Id: item.Id}, item), true)
	}
	return state
}

func (this *service) Remove(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		panic("This item not exists in the repository!")
	}

	return newState(state, this.repository.Delete(&pb.Item{Id: item.Id}), false)
}

func (this *service) RemoveByProduct(state *pb.Items, product *pb.Product) *pb.Items {
	if product.Id == 0 {
		panic("This product not exists in the repository!")
	}

	return newState(state, this.repository.Delete(&pb.Item{Product: product.Id}), false)
}

func (this *service) RemoveByDelivery(state *pb.Items, delivery *pb.Delivery) *pb.Items {
	if delivery.Id == 0 {
		panic("This product not exists in the repository!")
	}

	return newState(state, this.repository.Delete(&pb.Item{Delivery: delivery.Id}), false)
}
