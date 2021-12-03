package abstracts

import redux "github.com/janmbaco/go-redux/src"

type Actions struct {
	Set           redux.Action
	Remove        redux.Action
}

func NewActions() *Actions {
	return &Actions{}
}
