package abstracts

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type WhereFunc func(abstract *pb.Abstract)
type UpdateFunc func(delivery *pb.Abstract)

type Repository interface {
	Insert(abstract *pb.Abstract) *pb.Abstract
	Select(whereFunc WhereFunc) []*pb.Abstract
	Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Abstract
	Delete(whereFunc WhereFunc) []*pb.Abstract
}

type repository struct {
	dataAccess common.DataAccess
}

func (r repository) Insert(abstract *pb.Abstract) *pb.Abstract {

	r.dataAccess.Insert(abstract)
	return abstract
}

func (r repository) Select(whereFunc WhereFunc) []*pb.Abstract {

	result := make([]*pb.Abstract, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(result)

	return result

}

func (r repository) Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Abstract {

	abstracts := make([]*pb.Abstract, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Abstract, 0)

	r.dataAccess.Update(ids, updateTransform(updateFunc)).Get(ids, result)

	return result
}

func (r repository) Delete(whereFunc WhereFunc) []*pb.Abstract {

	abstracts := make([]*pb.Abstract, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Abstract, 0)
	r.dataAccess.Delete(ids, result)

	return result
}

func whereTransform(whereFunc WhereFunc) common.WhereFunc {
	return func(datamodel interface{}) {
		whereFunc(datamodel.(*pb.Abstract))
	}
}

func updateTransform(updateFunc UpdateFunc) common.UpdateFunc {
	return func(datamodel interface{}) {
		updateFunc(datamodel.(*pb.Abstract))
	}
}

func getIds(abstracts []*pb.Abstract) []int64 {
	ids := make([]int64, 0)
	for _, a := range abstracts {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
