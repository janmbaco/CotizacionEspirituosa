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
		this.repository.Insert(group)
	} else {
		this.repository.Update(&pb.Group{Id: group.Id}, group)
	}

	return this.Get()
}

func (this *service) Remove(state *pb.Groups, group *pb.Group) *pb.Groups {
	if group.Id == 0 {
		panic("This group not exists in the repository!")
	}

	if cancel := this.events.RemovingGroup(group); cancel {
		panic("Deletion was canceled through an event!")
	}

	this.repository.Delete(&pb.Group{Id: group.Id})
	return this.Get()
}
func (this *service) RemoveByAbstract(state *pb.Groups, abstract *pb.Abstract) *pb.Groups {
	if abstract.Id == 0 {
		panic("This abstract not exists in the repository!")
	}

	filter := &pb.Group{AbstractId: abstract.Id}
	groupsToDelete := this.repository.Select(filter)
	if len(groupsToDelete) > 0 {
		for _, group := range groupsToDelete  {
			if cancel := this.events.RemovingGroup(group); cancel {
				panic("Deletion was canceled through an event!")
			}
		}
		this.repository.Delete(filter)
	}
	return this.Get()
}
