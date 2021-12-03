import 'package:mobile_app/domain/models/delivery.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/delivery.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class DeliveriesProvider extends BaseProvider<Deliveries, Delivery> {
  DeliveriesProvider(DeliveryClient client)
      : super("deliveries", () => client.subscribe(NullRequest()), client.get,
            client.set, client.remove);
}
