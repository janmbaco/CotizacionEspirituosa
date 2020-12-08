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
		Abstracts: this.repository.Select(&pb.Abstract{}),
	}
}

func (this *service) Set(state *pb.Abstracts, abstract *pb.Abstract) *pb.Abstracts {
	if abstract.Id == 0 {
		abstract = this.repository.Insert(abstract)
		state.Abstracts = append(state.Abstracts, abstract)
	} else {
		state = newState(state, this.repository.Update(&pb.Abstract{Id: abstract.Id}, abstract), true)
	}

	return state
}

func (this *service) Remove(state *pb.Abstracts, abstract *pb.Abstract) *pb.Abstracts {
	if abstract.Id == 0 {
		panic("This abstract not exists in the repository!")
	}

	if cancel := this.events.RemovingAbstract(abstract); cancel {
		panic("Deletion was canceled through an event!")
	}

	return newState(state, this.repository.Delete(&pb.Abstract{Id: abstract.Id}), false)

}
