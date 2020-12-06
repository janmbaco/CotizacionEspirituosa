package abstracts

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Abstracts
	Set(state *pb.Abstracts, abstract *pb.Abstract) *pb.Abstract
	Remove(state *pb.Abstracts, abstract *pb.Abstract) *pb.Abstracts
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Abstracts {
	return &pb.Abstracts{
		Abstracts: this.repository.Select(func(a *pb.Abstract) bool {
			return true
		}),
	}
}

func (this *service) Set(state *pb.Abstracts, abstract *pb.Abstract) *pb.Abstracts {
	if abstract.Id == 0 {
		abstract = this.repository.Insert(abstract)
		state.Abstracts = append(state.Abstracts, abstract)
	} else {
		abstractsModifieds := this.repository.Update(abstract.Name, func(a *pb.Abstract) bool {
			return a.Id == abstract.Id
		})
		for _, a := range abstractsModifieds {
			for _, aState := range state.Abstracts {
				if a.Id == aState.Id {
					aState.Name = a.Name
				}
			}
		}
	}

	return state
}

func (this *service) Remove(state *pb.Abstracts, abstract *pb.Abstract) *pb.Abstracts {
	if abstract.Id == 0 {
		panic("This abstract not exists in the repository!")
	}
	this.events.RemovingAbstract(abstract)
	this.repository.Delete(func(a *pb.Abstract) bool {
		return a.Id == abstract.Id
	})

	newState := make([]*pb.Abstract, 0)
	for _, aState := range state.Abstracts {
		if abstract.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Abstracts = newState
	return state
}
