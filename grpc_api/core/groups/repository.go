package groups

import pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type WhereFunc func(group *pb.Group) bool
type Repository interface {
	Insert(group *pb.Group) *pb.Group
	Select(whereFunc WhereFunc) []*pb.Group
	Update(group *pb.Group, whereFunc WhereFunc) []*pb.Group
	Delete(whereFunc WhereFunc) []*pb.Group
}
