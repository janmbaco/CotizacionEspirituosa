package items

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type WhereFunc func(abstract *pb.Item)
type UpdateFunc func(delivery *pb.Item)

type Repository interface {
	Insert(abstract *pb.Item) *pb.Item
	Select(whereFunc WhereFunc) []*pb.Item
	Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Item
	Delete(whereFunc WhereFunc) []*pb.Item
}

type repository struct {
	dataAccess common.DataAccess
}

func (r repository) Insert(abstract *pb.Item) *pb.Item {

	r.dataAccess.Insert(abstract)
	return abstract
}

func (r repository) Select(whereFunc WhereFunc) []*pb.Item {

	result := make([]*pb.Item, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(result)

	return result

}

func (r repository) Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Item {

	abstracts := make([]*pb.Item, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Item, 0)

	r.dataAccess.Update(ids, updateTransform(updateFunc)).Get(ids, result)

	return result
}

func (r repository) Delete(whereFunc WhereFunc) []*pb.Item {

	abstracts := make([]*pb.Item, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Item, 0)
	r.dataAccess.Delete(ids, result)

	return result
}

func whereTransform(whereFunc WhereFunc) common.WhereFunc {
	return func(datamodel interface{}) {
		whereFunc(datamodel.(*pb.Item))
	}
}

func updateTransform(updateFunc UpdateFunc) common.UpdateFunc {
	return func(datamodel interface{}) {
		updateFunc(datamodel.(*pb.Item))
	}
}

func getIds(abstracts []*pb.Item) []int64 {
	ids := make([]int64, 0)
	for _, a := range abstracts {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
