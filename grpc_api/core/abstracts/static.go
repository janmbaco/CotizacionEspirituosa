package abstracts

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

func newState(state *pb.Abstracts, abstracts []*pb.Abstract, isModifying bool) *pb.Abstracts {
	mapAbstract := make(map[uint32]*pb.Abstract, len(abstracts))
	for _, a := range abstracts {
		mapAbstract[a.Id] = a
	}
	newAbstracts := make([]*pb.Abstract, 0)
	for _, aState := range state.Abstracts {
		if a, ok := mapAbstract[aState.Id]; ok {
			if isModifying {
				newAbstracts = append(newAbstracts, a)
			}
		} else {
			newAbstracts = append(newAbstracts, aState)
		}
	}
	state.Abstracts = newAbstracts
	return state
}

func GetIds(abstracts []*pb.Abstract) []int64 {
	ids := make([]int64, 0)
	for _, a := range abstracts {
		ids = append(ids, int64(a.Id))
	}
	return ids
}
