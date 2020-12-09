package groups

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

func newState(state *pb.Groups, groups []*pb.Group, isModifying bool) *pb.Groups {
	mapGroup := make(map[uint32]*pb.Group, len(groups))
	for _, a := range groups {
		mapGroup[a.Id] = a
	}
	newGroups := make([]*pb.Group, 0)
	for _, aState := range state.Groups {
		if a, ok := mapGroup[aState.Id]; ok {
			if isModifying {
				newGroups = append(newGroups, a)
			}
		} else {
			newGroups = append(newGroups, aState)
		}
	}
	state.Groups = newGroups
	return state
}

func GetIds(dataArray interface{}) []int64 {
	groups := dataArray.([]*pb.Group)
	ids := make([]int64, 0)
	for _, a := range groups {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
