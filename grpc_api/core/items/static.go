package items

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

func newState(state *pb.Items, items []*pb.Item, isModifying bool) *pb.Items {
	mapItem := make(map[uint32]*pb.Item, len(items))
	for _, a := range items {
		mapItem[a.Id] = a
	}
	newItems := make([]*pb.Item, 0)
	for _, aState := range state.Items {
		if a, ok := mapItem[aState.Id]; ok {
			if isModifying {
				newItems = append(newItems, a)
			}
		} else {
			newItems = append(newItems, aState)
		}
	}
	state.Items = newItems
	return state
}

func GetIds(items []*pb.Item) []int64 {
	ids := make([]int64, 0)
	for _, a := range items {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
