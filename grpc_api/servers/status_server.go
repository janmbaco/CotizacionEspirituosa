package servers

import (
	"context"

	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	ps "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/services"
)

type StatusService struct {
	*ps.UnimplementedStatusServer
}

func (this *StatusService) Get(context.Context, *models.NullRequest) (*models.ResultResponse, error) {
	return &models.ResultResponse{Result: models.Result_OK}, nil
}
