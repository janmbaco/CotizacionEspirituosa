package families

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

func newState(state *pb.Families, families []*pb.Family, isModifying bool) *pb.Families {
	mapFamily := make(map[uint32]*pb.Family, len(families))
	for _, a := range families {
		mapFamily[a.Id] = a
	}
	newFamilies := make([]*pb.Family, 0)
	for _, aState := range state.Families {
		if a, ok := mapFamily[aState.Id]; ok {
			if isModifying {
				newFamilies = append(newFamilies, a)
			}
		} else {
			newFamilies = append(newFamilies, aState)
		}
	}
	state.Families = newFamilies
	return state
}

func GetIds(dataArray interface{}) []int64 {
	families := dataArray.([]*pb.Family)
	ids := make([]int64, 0)
	for _, a := range families {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
