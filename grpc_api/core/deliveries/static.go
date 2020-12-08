package deliveries

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

func newState(state *pb.Deliveries, deliveries []*pb.Delivery, isModifying bool) *pb.Deliveries {
	mapDelivery := make(map[uint32]*pb.Delivery, len(deliveries))
	for _, a := range deliveries {
		mapDelivery[a.Id] = a
	}
	newDeliveries := make([]*pb.Delivery, 0)
	for _, aState := range state.Deliveries {
		if a, ok := mapDelivery[aState.Id]; ok {
			if isModifying {
				newDeliveries = append(newDeliveries, a)
			}
		} else {
			newDeliveries = append(newDeliveries, aState)
		}
	}
	state.Deliveries = newDeliveries
	return state
}

func GetIds(deliveries []*pb.Delivery) []int64 {
	ids := make([]int64, 0)
	for _, a := range deliveries {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
