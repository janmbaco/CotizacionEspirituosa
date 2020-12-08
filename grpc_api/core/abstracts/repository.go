package abstracts

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type Repository interface {
	Insert(abstract *pb.Abstract) *pb.Abstract
	Select(filter *pb.Abstract) []*pb.Abstract
	Update(filter *pb.Abstract, row *pb.Abstract) []*pb.Abstract
	Delete(filter *pb.Abstract) []*pb.Abstract
}

type repository struct {
	dataAccess common.DataAccess
}

func NewRepository(dataAccess common.DataAccess) Repository {
	return &repository{dataAccess: dataAccess}
}

func (r repository) Insert(abstract *pb.Abstract) *pb.Abstract {
	return r.dataAccess.Insert(abstract).(*pb.Abstract)
}

func (r repository) Select(filter *pb.Abstract) []*pb.Abstract {
	return r.dataAccess.Select(filter).([]*pb.Abstract)
}

func (r repository) Update(filter *pb.Abstract, row *pb.Abstract) []*pb.Abstract {
	return r.dataAccess.Update(filter, row).([]*pb.Abstract)
}

func (r repository) Delete(filter *pb.Abstract) []*pb.Abstract {
	return r.dataAccess.Delete(filter).([]*pb.Abstract)
}
