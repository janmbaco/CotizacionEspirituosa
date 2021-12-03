package servers

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"
	"github.com/janmbaco/go-infrastructure/errorhandler"
	redux "github.com/janmbaco/go-redux/src"
)

func tryStoreDispatch(store redux.Store, action redux.Action) *models.ResultResponse {
	result := &models.ResultResponse{}
	errorhandler.TryCatchError(func() {
		store.Dispatch(action)
	}, func(err error) {
		result.Result = models.Result_KO
		result.ErrorMessage = err.Error()
	})
	return result
}
