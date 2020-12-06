package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Items
	Set(state *pb.Items, item *pb.Item) *pb.Items
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
	return &pb.Items{
		Items: this.repository.Select(func(a *pb.Item) bool {
			return true
		}),
	}
}

func (this *service) Set(state *pb.Items, item *pb.Item) *pb.Items {
	if item.Id == 0 {
		item = this.repository.Insert(item)
		state.Items = append(state.Items, item)
	} else {
		itemsModifieds := this.repository.Update(item, func(a *pb.Item) bool {
			return a.Id == item.Id
		})
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
	this.repository.Delete(func(a *pb.Item) bool {
		return a.Id == item.Id
	})

	newState := make([]*pb.Item, 0)
	for _, aState := range state.Items {
		if item.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Items = newState
	return state
}
