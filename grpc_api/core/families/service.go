package families

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Families
	Set(state *pb.Families, family *pb.Family) *pb.Family
	Remove(state *pb.Families, family *pb.Family) *pb.Families
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Families {
	return &pb.Families{
		Families: this.repository.Select(&pb.Family{}),
	}
}

func (this *service) Set(state *pb.Families, family *pb.Family) *pb.Families {
	if family.Id == 0 {
		family = this.repository.Insert(family)
		state.Families = append(state.Families, family)
	} else {
		state = newState(state, this.repository.Update(&pb.Family{Id: family.Id}, family), true)
	}

	return state
}

func (this *service) Remove(state *pb.Families, family *pb.Family) *pb.Families {
	if family.Id == 0 {
		panic("This family not exists in the repository!")
	}

	if cancel := this.events.RemovingFamily(family); cancel {
		panic("Deletion was canceled through an event!")
	}

	state = newState(state, this.repository.Delete(&pb.Family{Id: family.Id}), false)

	return state
}
