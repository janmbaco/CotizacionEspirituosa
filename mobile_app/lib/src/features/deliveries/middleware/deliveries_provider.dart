import 'package:mobile_app/domain/models/delivery.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/delivery.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class DeliveriesProvider extends BaseProvider<Deliveries, Delivery> {
  DeliveriesProvider(DeliveryClient client)
      : super(client.get(NullRequest()), client.set, client.remove);
}
