package global

import (
	"github.com/janmbaco/go-infrastructure/events"
	"gorm.io/gorm"
)

type Context struct {
	DB        *gorm.DB
	Publisher events.Publisher
}

func NewContext(config *Config) *Context {
	return &Context{DB: NewDB(config.DataBaseInfo), Publisher: events.NewPublisher()}
}
