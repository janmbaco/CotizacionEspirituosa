package deliveries

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type WhereFunc func(abstract *pb.Delivery)
type UpdateFunc func(delivery *pb.Delivery)

type Repository interface {
	Insert(abstract *pb.Delivery) *pb.Delivery
	Select(whereFunc WhereFunc) []*pb.Delivery
	Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Delivery
	Delete(whereFunc WhereFunc) []*pb.Delivery
}

type repository struct {
	dataAccess common.DataAccess
}

func (r repository) Insert(abstract *pb.Delivery) *pb.Delivery {

	r.dataAccess.Insert(abstract)
	return abstract
}

func (r repository) Select(whereFunc WhereFunc) []*pb.Delivery {

	result := make([]*pb.Delivery, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(result)

	return result

}

func (r repository) Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Delivery {

	abstracts := make([]*pb.Delivery, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Delivery, 0)

	r.dataAccess.Update(ids, updateTransform(updateFunc)).Get(ids, result)

	return result
}

func (r repository) Delete(whereFunc WhereFunc) []*pb.Delivery {

	abstracts := make([]*pb.Delivery, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Delivery, 0)
	r.dataAccess.Delete(ids, result)

	return result
}

func whereTransform(whereFunc WhereFunc) common.WhereFunc {
	return func(datamodel interface{}) {
		whereFunc(datamodel.(*pb.Delivery))
	}
}

func updateTransform(updateFunc UpdateFunc) common.UpdateFunc {
	return func(datamodel interface{}) {
		updateFunc(datamodel.(*pb.Delivery))
	}
}

func getIds(abstracts []*pb.Delivery) []int64 {
	ids := make([]int64, 0)
	for _, a := range abstracts {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
