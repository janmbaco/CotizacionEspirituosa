package deliveries

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(delivery *pb.Delivery)
	Select(filter *pb.Delivery) []*pb.Delivery
	Update(filter *pb.Delivery, row *pb.Delivery)
	Delete(filter *pb.Delivery)
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(delivery *pb.Delivery) {
	 r.dataAccess.Insert(delivery)
}

func (r repository) Select(filter *pb.Delivery) []*pb.Delivery {
	return r.dataAccess.Select(filter).([]*pb.Delivery)
}

func (r repository) Update(filter *pb.Delivery, row *pb.Delivery)  {
	r.dataAccess.Update(filter, row)
}

func (r repository) Delete(filter *pb.Delivery) {
	 r.dataAccess.Delete(filter)
}
