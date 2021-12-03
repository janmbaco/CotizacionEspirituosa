import 'package:mobile_app/domain/services/abstract.pbgrpc.dart';
import 'package:mobile_app/domain/services/delivery.pbgrpc.dart';
import 'package:mobile_app/domain/services/family.pbgrpc.dart';
import 'package:mobile_app/domain/services/group.pbgrpc.dart';
import 'package:mobile_app/domain/services/item.pbgrpc.dart';
import 'package:mobile_app/domain/services/product.pbgrpc.dart';
import 'package:mobile_app/src/common/middleware/client_provider.dart';
import 'package:mobile_app/src/common/state/app_state.dart';
import 'package:mobile_app/src/features/abstracts/middleware/abstracts_provider.dart';
import 'package:mobile_app/src/features/deliveries/middleware/deliveries_provider.dart';
import 'package:mobile_app/src/features/families/middleware/families_provider.dart';
import 'package:mobile_app/src/features/groups/middleware/groups_provider.dart';
import 'package:mobile_app/src/features/items/middleware/items_provider.dart';
import 'package:mobile_app/src/features/products/middleware/products_provider.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';
import 'package:redux/redux.dart';

class MiddlewareFactory {
  final List<BaseProvider> _providers;

  MiddlewareFactory(ClientProvider clientProvider)
      : this._providers = [
          AbstractsProvider(
              clientProvider.getClient((channel) => AbstractClient(channel))),
          DeliveriesProvider(
              clientProvider.getClient((channel) => DeliveryClient(channel))),
          FamiliesProvider(
              clientProvider.getClient((channel) => FamilyClient(channel))),
          GroupsProvider(
              clientProvider.getClient((channel) => GroupClient(channel))),
          ItemsProvider(
              clientProvider.getClient((channel) => ItemClient(channel))),
          ProductsProvider(
              clientProvider.getClient((channel) => ProductClient(channel)))
        ];

  List<Middleware<AppState>> createMiddleWareStore() {
    List<Middleware<AppState>> result = List<Middleware<AppState>>();
    this._providers.forEach((provider) {
      result.add(TypedMiddleware(provider.connectReducer));
      result.add(TypedMiddleware(provider.getReducer));
      result.add(TypedMiddleware(provider.setReducer));
      result.add(TypedMiddleware(provider.removeReducer));
    });
    return result;
  }
}
