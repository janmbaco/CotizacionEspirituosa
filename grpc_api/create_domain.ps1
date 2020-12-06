$src_dir="..";
$models_dir="domain/models"
$services_dir="domain/services"
$proto_ext="*.proto"
$out_dir="..\..\..\..\"
$models = (Get-ChildItem -Path "$src_dir/$models_dir" -Recurse -Name -Include $proto_ext  | ForEach-Object { "$models_dir/$_"})
$services =  (Get-ChildItem -Path "$src_dir/$services_dir" -Recurse -Name -Include $proto_ext  | ForEach-Object { "$services_dir/$_"})



protoc.exe  $models -I="$src_dir" --go_out=$out_dir 

protoc.exe $services -I="$src_dir" --go-grpc_out=$out_dir 








