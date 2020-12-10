package app

import (
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/configs"
	"github.com/janmbaco/CotizacionEspirituosa/grpc_api/persistence"
	"github.com/janmbaco/go-infrastructure/events"
	"gorm.io/gorm"
)

type Context struct {
	DB        *gorm.DB
	Publisher events.Publisher
}

func NewContext(config *configs.Config) *Context {
	return &Context{DB: persistence.NewDB(config.DataBaseInfo), Publisher: events.NewPublisher()}
}
