import 'package:mobile_app/domain/models/family.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/family.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class FamiliesProvider extends BaseProvider<Families, Family> {
  FamiliesProvider(FamilyClient client)
      : super(client.get(NullRequest()), client.set, client.remove);
}
