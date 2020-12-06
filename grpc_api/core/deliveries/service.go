package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Deliveries
	Set(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries
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
	return &pb.Deliveries{
		Deliveries: this.repository.Select(func(a *pb.Delivery) bool {
			return true
		}),
	}
}

func (this *service) Set(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries {
	if delivery.Id == 0 {
		delivery = this.repository.Insert(delivery)
		state.Deliveries = append(state.Deliveries, delivery)
	} else {
		deliveriesModifieds := this.repository.Update(delivery, func(a *pb.Delivery) bool {
			return a.Id == delivery.Id
		})
		for _, a := range deliveriesModifieds {
			for _, aState := range state.Deliveries {
				if a.Id == aState.Id {
					delivery = a
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
	this.repository.Delete(func(a *pb.Delivery) bool {
		return a.Id == delivery.Id
	})

	newState := make([]*pb.Delivery, 0)
	for _, aState := range state.Deliveries {
		if delivery.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Deliveries = newState
	return state
}
