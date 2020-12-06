package servers

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	redux "github.com/janmbaco/go-redux/core"
)

type BaseServer struct {
	store redux.Store
}

func (this *BaseServer) tryStoreDispatch(action redux.Action) *models.ResultResponse {
	result := &models.ResultResponse{}
	errorhandler.TryCatchError(func() {
		this.store.Dispatch(action)
	}, func(err error) {
		result.Result = models.Result_KO
		result.ErrorMessage = err.Error()
	})
	return result
}
