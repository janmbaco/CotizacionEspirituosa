package items

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(item *pb.Item)
	Select(filter *pb.Item) []*pb.Item
	Update(filter *pb.Item, row *pb.Item)
	Delete(filter *pb.Item)
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(item *pb.Item) {
	r.dataAccess.Insert(item)
}

func (r repository) Select(filter *pb.Item) []*pb.Item {
	return r.dataAccess.Select(filter).([]*pb.Item)
}

func (r repository) Update(filter *pb.Item, row *pb.Item) {
	r.dataAccess.Update(filter, row)
}

func (r repository) Delete(filter *pb.Item) {
	 r.dataAccess.Delete(filter)
}
