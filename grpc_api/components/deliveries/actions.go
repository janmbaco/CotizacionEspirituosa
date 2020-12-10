package deliveries

import redux "github.com/janmbaco/go-redux/core"

type Actions struct {
	ActionsObject redux.ActionsObject
	Set           redux.Action
	Remove        redux.Action
	RemoveByGroup redux.Action
}

func NewActions() *Actions {
	result := &Actions{}
	result.ActionsObject = redux.NewActionsObject(result)
	return result
}
