import 'package:mobile_app/domain/models/item.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/item.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class ItemsProvider extends BaseProvider<Items, Item> {
  ItemsProvider(ItemClient client)
      : super("items", () => client.subscribe(NullRequest()), client.get,
            client.set, client.remove);
}
