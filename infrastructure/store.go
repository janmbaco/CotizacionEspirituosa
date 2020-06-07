package infrastructure

import "cotizacionespirituosa-server/core/types"

type Store interface {
	GetQuote() []*types.QuoteGroup
	SetQuote(group *types.QuoteGroup)
	GetStock() []*types.Stock
	SetStock(stock *types.Stock)
}

