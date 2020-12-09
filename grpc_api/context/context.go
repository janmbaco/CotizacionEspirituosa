package context

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/config"
	"github.com/janmbaco/go-infrastructure/events"
	"gorm.io/gorm"
)

type Context struct {
	DB        *gorm.DB
	Publisher events.Publisher
}

func NewContext(config *config.Config) *Context {
	return &Context{}
}
