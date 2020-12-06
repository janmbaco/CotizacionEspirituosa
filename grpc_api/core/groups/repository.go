package groups

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type WhereFunc func(abstract *pb.Group)
type UpdateFunc func(delivery *pb.Group)

type Repository interface {
	Insert(abstract *pb.Group) *pb.Group
	Select(whereFunc WhereFunc) []*pb.Group
	Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Group
	Delete(whereFunc WhereFunc) []*pb.Group
}

type repository struct {
	dataAccess common.DataAccess
}

func (r repository) Insert(abstract *pb.Group) *pb.Group {

	r.dataAccess.Insert(abstract)
	return abstract
}

func (r repository) Select(whereFunc WhereFunc) []*pb.Group {

	result := make([]*pb.Group, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(result)

	return result

}

func (r repository) Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Group {

	abstracts := make([]*pb.Group, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Group, 0)

	r.dataAccess.Update(ids, updateTransform(updateFunc)).Get(ids, result)

	return result
}

func (r repository) Delete(whereFunc WhereFunc) []*pb.Group {

	abstracts := make([]*pb.Group, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Group, 0)
	r.dataAccess.Delete(ids, result)

	return result
}

func whereTransform(whereFunc WhereFunc) common.WhereFunc {
	return func(datamodel interface{}) {
		whereFunc(datamodel.(*pb.Group))
	}
}

func updateTransform(updateFunc UpdateFunc) common.UpdateFunc {
	return func(datamodel interface{}) {
		updateFunc(datamodel.(*pb.Group))
	}
}

func getIds(abstracts []*pb.Group) []int64 {
	ids := make([]int64, 0)
	for _, a := range abstracts {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
