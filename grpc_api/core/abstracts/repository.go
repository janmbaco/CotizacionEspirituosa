package abstracts

import "github.com/janmbaco/CotizacionEspirituosa/grpc_api/domain/models"

type WhereFunc func(abstract *models.Abstract) bool

type Repository interface {
	Insert(abstract *models.Abstract) *models.Abstract
	Select(whereFunc WhereFunc) []*models.Abstract
	Update(abstractName string, whereFunc WhereFunc) []*models.Abstract
	Delete(whereFunc WhereFunc) []*models.Abstract
}
