import 'package:mobile_app/domain/models/abstract.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/abstract.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class AbstractsProvider extends BaseProvider<Abstracts, Abstract> {
  AbstractsProvider(AbstractClient client)
      : super(client.get(NullRequest()), client.set, client.remove);
}
