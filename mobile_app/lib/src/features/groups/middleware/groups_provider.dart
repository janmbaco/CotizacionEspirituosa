import 'package:mobile_app/domain/models/group.pb.dart';
import 'package:mobile_app/domain/models/request.pb.dart';
import 'package:mobile_app/domain/services/group.pbgrpc.dart';
import 'package:mobile_app/src/features/shared/middleware/base_provider.dart';

class GroupsProvider extends BaseProvider<Groups, Group> {
  GroupsProvider(GroupClient client)
      : super(client.get(NullRequest()), client.set, client.remove);
}
