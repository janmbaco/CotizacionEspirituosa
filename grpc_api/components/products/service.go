package products

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Products
	Set(state *pb.Products, product *pb.Product) *pb.Products
	Remove(state *pb.Products, product *pb.Product) *pb.Products
	RemoveByFamily(state *pb.Products, family *pb.Family) *pb.Products
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository, events Events) Service {
	return &service{repository: repository, events: events}
}

func (this *service) Get() *pb.Products {
	return &pb.Products{
		Products: this.repository.Select(&pb.Product{}),
	}
}

func (this *service) Set(state *pb.Products, product *pb.Product) *pb.Products {
	if product.Id == 0 {
		this.repository.Insert(product)
	} else {
		this.repository.Update(&pb.Product{Id: product.Id}, product)
	}

	return this.Get()
}

func (this *service) Remove(state *pb.Products, product *pb.Product) *pb.Products {
	if product.Id == 0 {
		panic("This product not exists in the repository!")
	}

	if cancel := this.events.RemovingProduct(product); cancel {
		panic("Deletion was canceled through an event!")
	}

	this.repository.Delete(&pb.Product{Id: product.Id})

	return this.Get()
}

func (this *service) RemoveByFamily(state *pb.Products, family *pb.Family) *pb.Products {
	if family.Id == 0 {
		panic("This family not exists in the repository!")
	}

	filter := &pb.Product{FamilyId: family.Id}
	for _, product := range this.repository.Select(filter) {
		if cancel := this.events.RemovingProduct(product); cancel {
			panic("Deletion was canceled through an event!")
		}
	}

	this.repository.Delete(filter)
	return this.Get()
}