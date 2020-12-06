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
	all := func(a *pb.Family) {}
	return &pb.Families{
		Families: this.repository.Select(all),
	}
}

func (this *service) Set(state *pb.Families, family *pb.Family) *pb.Families {
	if family.Id == 0 {
		family = this.repository.Insert(family)
		state.Families = append(state.Families, family)
	} else {
		where := func(a *pb.Family) { a.Id = family.Id }
		update := func(a *pb.Family) { a = family }
		familysModifieds := this.repository.Update(update, where)
		for _, a := range familysModifieds {
			for _, aState := range state.Families {
				if a.Id == aState.Id {
					aState = a
				}
			}
		}
	}

	return state
}

func (this *service) Remove(state *pb.Families, family *pb.Family) *pb.Families {
	if family.Id == 0 {
		panic("This family not exists in the repository!")
	}
	this.events.RemovingFamily(family)
	where := func(a *pb.Family) { a.Id = family.Id }
	this.repository.Delete(where)
	newState := make([]*pb.Family, 0)
	for _, aState := range state.Families {
		if family.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Families = newState
	return state
}
