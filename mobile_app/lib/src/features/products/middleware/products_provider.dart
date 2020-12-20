import 'package:mobile_app/domain/models/product.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/product.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class ProductsProvider extends BaseProvider<Products, Product> {
  ProductsProvider(ProductClient client)
      : super(client.get(NullRequest()), client.set, client.remove);
}
