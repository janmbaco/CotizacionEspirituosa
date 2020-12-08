package families

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Repository interface {
	Insert(family *pb.Family) *pb.Family
	Select(filter *pb.Family) []*pb.Family
	Update(filter *pb.Family, row *pb.Family) []*pb.Family
	Delete(filter *pb.Family) []*pb.Family
}

type repository struct {
	dataAccess common.DataAccess
}

func NewRepository(dataAccess common.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(family *pb.Family) *pb.Family {
	return r.dataAccess.Insert(family).(*pb.Family)
}

func (r repository) Select(filter *pb.Family) []*pb.Family {
	return r.dataAccess.Select(filter).([]*pb.Family)
}

func (r repository) Update(filter *pb.Family, row *pb.Family) []*pb.Family {
	return r.dataAccess.Update(filter, row).([]*pb.Family)
}

func (r repository) Delete(filter *pb.Family) []*pb.Family {
	return r.dataAccess.Delete(filter).([]*pb.Family)
}
