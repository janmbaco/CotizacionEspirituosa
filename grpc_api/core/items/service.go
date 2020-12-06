package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Items
	Set(state *pb.Items, item *pb.Item) *pb.Item
	Remove(state *pb.Items, item *pb.Item) *pb.Items
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Items {
	all := func(a *pb.Item) {}
	return &pb.Items{
		Items: this.repository.Select(all),
	}
}

func (this *service) Set(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		item = this.repository.Insert(item)
		state.Items = append(state.Items, item)
	} else {
		where := func(a *pb.Item) { a.Id = item.Id }
		update := func(a *pb.Item) { a = item }
		itemsModifieds := this.repository.Update(update, where)
		for _, a := range itemsModifieds {
			for _, aState := range state.Items {
				if a.Id == aState.Id {
					aState = a
				}
			}
		}
	}

	return state
}

func (this *service) Remove(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		panic("This item not exists in the repository!")
	}
	this.events.RemovingItem(item)
	where := func(a *pb.Item) { a.Id = item.Id }
	this.repository.Delete(where)
	newState := make([]*pb.Item, 0)
	for _, aState := range state.Items {
		if item.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Items = newState
	return state
}
