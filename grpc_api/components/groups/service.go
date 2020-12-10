package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Groups
	Set(state *pb.Groups, group *pb.Group) *pb.Groups
	Remove(state *pb.Groups, group *pb.Group) *pb.Groups
	RemoveByAbstract(state *pb.Groups, abstract *pb.Abstract) *pb.Groups
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository, events Events) Service {
	return &service{repository: repository, events: events}
}

func (this *service) Get() *pb.Groups {
	return &pb.Groups{
		Groups: this.repository.Select(&pb.Group{}),
	}
}

func (this *service) Set(state *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		group = this.repository.Insert(group)
		state.Groups = append(state.Groups, group)
	} else {
		state = newState(state, this.repository.Update(&pb.Group{Id: group.Id}, group), true)
	}

	return state
}

func (this *service) Remove(state *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		panic("This group not exists in the repository!")
	}

	if cancel := this.events.RemovingGroup(group); cancel {
		panic("Deletion was canceled through an event!")
	}

	return newState(state, this.repository.Delete(&pb.Group{Id: group.Id}), false)
}
func (this *service) RemoveByAbstract(state *pb.Groups, abstract *pb.Abstract) *pb.Groups {
	if abstract.Id == 0 {
		panic("This abstract not exists in the repository!")
	}

	filter := &pb.Group{Abstract: abstract.Id}
	for _, group := range this.repository.Select(filter) {
		if cancel := this.events.RemovingGroup(group); cancel {
			panic("Deletion was canceled through an event!")
		}
	}

	return newState(state, this.repository.Delete(filter), false)
}
