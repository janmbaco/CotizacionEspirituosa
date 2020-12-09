package config

import (
	"github.com/janmbaco/go-infrastructure/config"
)

type Config struct {
	config.ConfigHandler
	Port         string       `json:"port"`
	DataBaseInfo DataBaseInfo `json:"database_info"`
	LogInfo      LogInfo      `json:"log_info"`
}

func NewConfig(configHandler config.ConfigHandler, port string, dataBaseInfo DataBaseInfo, logInfo LogInfo) *Config {
	result := &Config{ConfigHandler: configHandler, Port: port, DataBaseInfo: dataBaseInfo, LogInfo: logInfo}
	result.Load(&Config{})
	return result
}
