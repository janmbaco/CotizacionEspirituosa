package products

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Service interface {
	Get() *pb.Products
	Set(state *pb.Products, product *pb.Product) *pb.Product
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
	all := func(a *pb.Product) {}
	return &pb.Products{
		Products: this.repository.Select(all),
	}
}

func (this *service) Set(state *pb.Products, product *pb.Product) *pb.Products {
	if product.Id == 0 {
		product = this.repository.Insert(product)
		state.Products = append(state.Products, product)
	} else {
		where := func(a *pb.Product) { a.Id = product.Id }
		update := func(a *pb.Product) { a = product }
		productsModifieds := this.repository.Update(update, where)
		for _, a := range productsModifieds {
			for _, aState := range state.Products {
				if a.Id == aState.Id {
					aState = a
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
	where := func(a *pb.Product) { a.Id = product.Id }
	this.repository.Delete(where)
	newState := make([]*pb.Product, 0)
	for _, aState := range state.Products {
		if product.Id != aState.Id {
			newState = append(newState, aState)
		}
	}
	state.Products = newState
	return state
}
