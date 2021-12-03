package products

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

const Selector = "products"

func newState(state *pb.Products, products []*pb.Product, isModifying bool) *pb.Products {
	mapProduct := make(map[uint32]*pb.Product, len(products))
	for _, a := range products {
		mapProduct[a.Id] = a
	}
	newProducts := make([]*pb.Product, 0)
	for _, aState := range state.Products {
		if a, ok := mapProduct[aState.Id]; ok {
			if isModifying {
				newProducts = append(newProducts, a)
			}
		} else {
			newProducts = append(newProducts, aState)
		}
	}
	state.Products = newProducts
	return state
}

func GetIds(dataArray interface{}) []int64 {
	products := dataArray.([]*pb.Product)
	ids := make([]int64, 0)
	for _, a := range products {
		ids = append(ids, int64(a.Id))
	}
	return ids
}