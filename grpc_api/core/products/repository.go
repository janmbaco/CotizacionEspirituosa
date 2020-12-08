package products

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Repository interface {
	Insert(product *pb.Product) *pb.Product
	Select(filter *pb.Product) []*pb.Product
	Update(filter *pb.Product, row *pb.Product) []*pb.Product
	Delete(filter *pb.Product) []*pb.Product
}

type repository struct {
	dataAccess common.DataAccess
}

func NewRepository(dataAccess common.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(product *pb.Product) *pb.Product {
	return r.dataAccess.Insert(product).(*pb.Product)
}

func (r repository) Select(filter *pb.Product) []*pb.Product {
	return r.dataAccess.Select(filter).([]*pb.Product)
}

func (r repository) Update(filter *pb.Product, row *pb.Product) []*pb.Product {
	return r.dataAccess.Update(filter, row).([]*pb.Product)
}

func (r repository) Delete(filter *pb.Product) []*pb.Product {
	return r.dataAccess.Delete(filter).([]*pb.Product)
}
