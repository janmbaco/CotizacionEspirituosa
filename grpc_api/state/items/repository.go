package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(item *pb.Item) *pb.Item
	Select(filter *pb.Item) []*pb.Item
	Update(filter *pb.Item, row *pb.Item) []*pb.Item
	Delete(filter *pb.Item) []*pb.Item
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(item *pb.Item) *pb.Item {
	return r.dataAccess.Insert(item).(*pb.Item)
}

func (r repository) Select(filter *pb.Item) []*pb.Item {
	return r.dataAccess.Select(filter).([]*pb.Item)
}

func (r repository) Update(filter *pb.Item, row *pb.Item) []*pb.Item {
	return r.dataAccess.Update(filter, row).([]*pb.Item)
}

func (r repository) Delete(filter *pb.Item) []*pb.Item {
	return r.dataAccess.Delete(filter).([]*pb.Item)
}
