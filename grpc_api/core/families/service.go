package families

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Families
	Set(state *pb.Families, family *pb.Family) *pb.Families
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
		Families: this.repository.Select(func(a *pb.Family) bool {
			return true
		}),
	}
}

func (this *service) Set(state *pb.Families, family *pb.Family) *pb.Families {
	if family.Id == 0 {
		family = this.repository.Insert(family)
		state.Families = append(state.Families, family)
	} else {
		familiesModifieds := this.repository.Update(family.Name, func(a *pb.Family) bool {
			return a.Id == family.Id
		})
		for _, a := range familiesModifieds {
			for _, aState := range state.Families {
				if a.Id == aState.Id {
					aState.Name = a.Name
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
	this.events.RemovingAbstract(family)
	this.repository.Delete(func(a *pb.Family) bool {
		return a.Id == family.Id
	})

	newState := make([]*pb.Family, 0)
	for _, aState := range state.Families {
		if family.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Families = newState
	return state
}
