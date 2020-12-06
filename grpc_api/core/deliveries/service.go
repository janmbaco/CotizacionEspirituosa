package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Deliveries
	Set(state *pb.Deliveries, delivery *pb.Delivery) *pb.Delivery
	Remove(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Deliveries {
	all := func(a *pb.Delivery) {}
	return &pb.Deliveries{
		Deliveries: this.repository.Select(all),
	}
}

func (this *service) Set(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries {
	if delivery.Id == 0 {
		delivery = this.repository.Insert(delivery)
		state.Deliveries = append(state.Deliveries, delivery)
	} else {
		where := func(a *pb.Delivery) { a.Id = delivery.Id }
		update := func(a *pb.Delivery) { a = delivery }
		deliverysModifieds := this.repository.Update(update, where)
		for _, a := range deliverysModifieds {
			for _, aState := range state.Deliveries {
				if a.Id == aState.Id {
					aState = a
				}
			}
		}
	}

	return state
}

func (this *service) Remove(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries {
	if delivery.Id == 0 {
		panic("This delivery not exists in the repository!")
	}
	this.events.RemovingDelivery(delivery)
	where := func(a *pb.Delivery) { a.Id = delivery.Id }
	this.repository.Delete(where)
	newState := make([]*pb.Delivery, 0)
	for _, aState := range state.Deliveries {
		if delivery.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Deliveries = newState
	return state
}
