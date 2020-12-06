package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/items"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type ItemServer struct {
	*ps.UnimplementedItemServer
	*BaseServer
	actions *items.Actions
	entity  items.Entity
}

func (s *ItemServer) Get(_ *pb.NullRequest, stream ps.Item_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *ItemServer) Set(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Set.With(item)), nil
}

func (s *ItemServer) Remove(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return s.tryStoreDispatch(s.actions.Remove.With(item)), nil
}
