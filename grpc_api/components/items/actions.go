package items

import redux "github.com/janmbaco/go-redux/src"

type Actions struct {
	Set              redux.Action
	Remove           redux.Action
	RemoveByProduct  redux.Action
	RemoveByDelivery redux.Action
}

func NewActions() *Actions {
	return &Actions{}
}
