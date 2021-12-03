package families

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(family *pb.Family)
	Select(filter *pb.Family) []*pb.Family
	Update(filter *pb.Family, row *pb.Family)
	Delete(filter *pb.Family)
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(family *pb.Family)  {
	 r.dataAccess.Insert(family)
}

func (r repository) Select(filter *pb.Family) []*pb.Family {
	return r.dataAccess.Select(filter).([]*pb.Family)
}

func (r repository) Update(filter *pb.Family, row *pb.Family)  {
	r.dataAccess.Update(filter, row)
}

func (r repository) Delete(filter *pb.Family)  {
	 r.dataAccess.Delete(filter)
}
