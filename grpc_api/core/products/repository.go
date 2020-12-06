package products

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
)

type WhereFunc func(abstract *pb.Product)
type UpdateFunc func(delivery *pb.Product)

type Repository interface {
	Insert(abstract *pb.Product) *pb.Product
	Select(whereFunc WhereFunc) []*pb.Product
	Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Product
	Delete(whereFunc WhereFunc) []*pb.Product
}

type repository struct {
	dataAccess common.DataAccess
}

func (r repository) Insert(abstract *pb.Product) *pb.Product {

	r.dataAccess.Insert(abstract)
	return abstract
}

func (r repository) Select(whereFunc WhereFunc) []*pb.Product {

	result := make([]*pb.Product, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(result)

	return result

}

func (r repository) Update(updateFunc UpdateFunc, whereFunc WhereFunc) []*pb.Product {

	abstracts := make([]*pb.Product, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Product, 0)

	r.dataAccess.Update(ids, updateTransform(updateFunc)).Get(ids, result)

	return result
}

func (r repository) Delete(whereFunc WhereFunc) []*pb.Product {

	abstracts := make([]*pb.Product, 0)
	r.dataAccess.Select(whereTransform(whereFunc)).Find(abstracts)

	ids := getIds(abstracts)

	result := make([]*pb.Product, 0)
	r.dataAccess.Delete(ids, result)

	return result
}

func whereTransform(whereFunc WhereFunc) common.WhereFunc {
	return func(datamodel interface{}) {
		whereFunc(datamodel.(*pb.Product))
	}
}

func updateTransform(updateFunc UpdateFunc) common.UpdateFunc {
	return func(datamodel interface{}) {
		updateFunc(datamodel.(*pb.Product))
	}
}

func getIds(abstracts []*pb.Product) []int64 {
	ids := make([]int64, 0)
	for _, a := range abstracts {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
