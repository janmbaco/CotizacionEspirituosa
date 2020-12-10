package groups

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(group *pb.Group) *pb.Group
	Select(filter *pb.Group) []*pb.Group
	Update(filter *pb.Group, row *pb.Group) []*pb.Group
	Delete(filter *pb.Group) []*pb.Group
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(group *pb.Group) *pb.Group {
	return r.dataAccess.Insert(group).(*pb.Group)
}

func (r repository) Select(filter *pb.Group) []*pb.Group {
	return r.dataAccess.Select(filter).([]*pb.Group)
}

func (r repository) Update(filter *pb.Group, row *pb.Group) []*pb.Group {
	return r.dataAccess.Update(filter, row).([]*pb.Group)
}

func (r repository) Delete(filter *pb.Group) []*pb.Group {
	return r.dataAccess.Delete(filter).([]*pb.Group)
}
