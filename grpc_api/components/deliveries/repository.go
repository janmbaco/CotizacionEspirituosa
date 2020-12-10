package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(delivery *pb.Delivery) *pb.Delivery
	Select(filter *pb.Delivery) []*pb.Delivery
	Update(filter *pb.Delivery, row *pb.Delivery) []*pb.Delivery
	Delete(filter *pb.Delivery) []*pb.Delivery
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(delivery *pb.Delivery) *pb.Delivery {
	return r.dataAccess.Insert(delivery).(*pb.Delivery)
}

func (r repository) Select(filter *pb.Delivery) []*pb.Delivery {
	return r.dataAccess.Select(filter).([]*pb.Delivery)
}

func (r repository) Update(filter *pb.Delivery, row *pb.Delivery) []*pb.Delivery {
	return r.dataAccess.Update(filter, row).([]*pb.Delivery)
}

func (r repository) Delete(filter *pb.Delivery) []*pb.Delivery {
	return r.dataAccess.Delete(filter).([]*pb.Delivery)
}
