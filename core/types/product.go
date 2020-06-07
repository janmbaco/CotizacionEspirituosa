package types

type Product struct {
	Family *ProductFamily
	Name          string
	Packages []*ProductPackage
}
