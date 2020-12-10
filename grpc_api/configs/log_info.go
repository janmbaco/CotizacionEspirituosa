package configs

import "github.com/janmbaco/go-infrastructure/logs"

type LogInfo struct {
	ConsoleLevel logs.LogLevel `json:"console_level"`
	FileLevel    logs.LogLevel `json:"file_level"`
	LogsDir      string        `json:"logs_dir"`
}

func NewLogInfo(consoleLevel logs.LogLevel, fileLevel logs.LogLevel, logsDir string) *LogInfo {
	return &LogInfo{ConsoleLevel: consoleLevel, FileLevel: fileLevel, LogsDir: logsDir}
}
