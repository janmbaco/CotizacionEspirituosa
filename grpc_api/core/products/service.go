package products

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Products
	Set(state *pb.Products, product *pb.Product) *pb.Products
	Remove(state *pb.Products, product *pb.Product) *pb.Products
}

type service struct {
	repository Repository
	events     Events
}

func NewService(repository Repository) *service {
	return &service{repository: repository}
}

func (this *service) Get() *pb.Products {
	return &pb.Products{
		Products: this.repository.Select(func(a *pb.Product) bool {
			return true
		}),
	}
}

func (this *service) Set(state *pb.Products, product *pb.Product) *pb.Products {
	if product.Id == 0 {
		product = this.repository.Insert(product)
		state.Products = append(state.Products, product)
	} else {
		abstractModified := this.repository.Update(product.Name, func(a *pb.Product) bool {
			return a.Id == product.Id
		})
		for _, a := range abstractModified {
			for _, aState := range state.Products {
				if a.Id == aState.Id {
					aState.Name = a.Name
				}
			}
		}
	}

	return state
}

func (this *service) Remove(state *pb.Products, product *pb.Product) *pb.Products {
	if product.Id == 0 {
		panic("This product not exists in the repository!")
	}
	this.events.RemovingProduct(product)
	this.repository.Delete(func(a *pb.Product) bool {
		return a.Id == product.Id
	})

	newState := make([]*pb.Product, 0)
	for _, aState := range state.Products {
		if product.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Products = newState
	return state
}
