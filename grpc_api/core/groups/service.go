package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Groups
	Set(state *pb.Groups, group *pb.Group) *pb.Group
	Remove(state *pb.Groups, group *pb.Group) *pb.Groups
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Groups {
	all := func(a *pb.Group) {}
	return &pb.Groups{
		Groups: this.repository.Select(all),
	}
}

func (this *service) Set(state *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		group = this.repository.Insert(group)
		state.Groups = append(state.Groups, group)
	} else {
		where := func(a *pb.Group) { a.Id = group.Id }
		update := func(a *pb.Group) { a = group }
		groupsModifieds := this.repository.Update(update, where)
		for _, a := range groupsModifieds {
			for _, aState := range state.Groups {
				if a.Id == aState.Id {
					aState.Name = a.Name
				}
			}
		}
	}

	return state
}

func (this *service) Remove(state *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		panic("This group not exists in the repository!")
	}
	this.events.RemovingGroup(group)
	where := func(a *pb.Group) { a.Id = group.Id }
	this.repository.Delete(where)
	newState := make([]*pb.Group, 0)
	for _, aState := range state.Groups {
		if group.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Groups = newState
	return state
}
