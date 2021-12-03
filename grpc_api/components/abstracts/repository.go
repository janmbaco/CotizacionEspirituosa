package abstracts

import (
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
)

type Repository interface {
	Insert(abstract *pb.Abstract)
	Select(filter *pb.Abstract) []*pb.Abstract
	Update(filter *pb.Abstract, row *pb.Abstract)
	Delete(filter *pb.Abstract)
}

type repository struct {
	dataAccess persistence.DataAccess
}

func NewRepository(dataAccess persistence.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(abstract *pb.Abstract) {
	 r.dataAccess.Insert(abstract)
}

func (r repository) Select(filter *pb.Abstract) []*pb.Abstract {
	return r.dataAccess.Select(filter).([]*pb.Abstract)
}

func (r repository) Update(filter *pb.Abstract, row *pb.Abstract) {
	r.dataAccess.Update(filter, row)
}

func (r repository) Delete(filter *pb.Abstract) {
	 r.dataAccess.Delete(filter)
}
