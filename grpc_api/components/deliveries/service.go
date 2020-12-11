package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Deliveries
	Set(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries
	Remove(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries
	RemoveByGroup(state *pb.Deliveries, group *pb.Group) *pb.Deliveries
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository, events Events) Service {
	return &service{repository: repository, events: events}
}

func (this *service) Get() *pb.Deliveries {
	return &pb.Deliveries{
		Deliveries: this.repository.Select(&pb.Delivery{}),
	}
}

func (this *service) Set(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries {
	if delivery.Id == 0 {
		delivery = this.repository.Insert(delivery)
		state.Deliveries = append(state.Deliveries, delivery)
	} else {
		state = newState(state, this.repository.Update(&pb.Delivery{Id: delivery.Id}, delivery), true)
	}

	return state
}

func (this *service) Remove(state *pb.Deliveries, delivery *pb.Delivery) *pb.Deliveries {
	if delivery.Id == 0 {
		panic("This delivery not exists in the repository!")
	}

	if cancel := this.events.RemovingDelivery(delivery); cancel {
		panic("Deletion was canceled through an event!")
	}

	return newState(state, this.repository.Delete(&pb.Delivery{Id: delivery.Id}), false)
}

func (this *service) RemoveByGroup(state *pb.Deliveries, group *pb.Group) *pb.Deliveries {
	if group.Id == 0 {
		panic("This group not exists in the repository!")
	}

	filter := &pb.Delivery{GroupId: group.Id}
	for _, delivery := range this.repository.Select(filter) {
		if cancel := this.events.RemovingDelivery(delivery); cancel {
			panic("Deletion was canceled through an event!")
		}
	}

	return newState(state, this.repository.Delete(filter), false)
}
