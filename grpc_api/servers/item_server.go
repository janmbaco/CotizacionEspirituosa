package servers

import (
	"context"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/common"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/core/items"
	pb "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
	redux "github.com/janmbaco/go-redux/core"
)

type ItemServer struct {
	*ps.UnimplementedItemServer
	store   redux.Store
	actions *items.Actions
	entity  items.Entity
}

func (s *ItemServer) Get(_ *pb.NullRequest, stream ps.Item_GetServer) error {
	common.NewStateSender(s.store, s.entity, stream).Initialize()
	return nil
}

func (s *ItemServer) Set(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Set.With(item)), nil
}

func (s *ItemServer) Remove(_ context.Context, item *pb.Item) (*pb.ResultResponse, error) {
	return tryStoreDispatch(s.store, s.actions.Remove.With(item)), nil
}
