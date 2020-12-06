package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() []*pb.Group
	Set(groups *pb.Groups, group *pb.Group) *pb.Groups
	Remove(groups []*pb.Groups, group *pb.Group) []*pb.Groups
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() []*pb.Group {
	return this.repository.Select(func(a *pb.Group) bool {
		return true
	})
}

func (this *service) Set(groups *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		group = this.repository.Insert(group)
		groups.Groups = append(groups.Groups, group)
	} else {
		groupsModfieds := this.repository.Update(group, func(a *pb.Group) bool {
			return a.Id == group.Id
		})
		for _, g := range groupsModfieds {
			for _, gState := range groups.Groups {
				if g.Id == gState.Id {
					gState = g
					this.events.ChangedGroup(g)
				}
			}
		}
	}

	return groups
}

func (this *service) Remove(state *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		panic("This group not exists in the repository!")
	}
	this.events.RemovingGroup(group)
	this.repository.Delete(func(a *pb.Group) bool {
		return a.Id == group.Id
	})

	newState := make([]*pb.Group, 0)
	for _, gState := range state.Groups {
		if group.Id != gState.Id {
			newState = append(newState, gState)
		}
	}
	state.Groups = newState

	return state
}
