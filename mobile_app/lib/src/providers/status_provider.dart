import 'package:mobile_app/domain/models/status.pb.dart';
import 'package:grpc/grpc.dart';
import 'package:mobile_app/domain/services/status_service.pbgrpc.dart';

class _StatusProvider{
  ClientChannel channel;
  StatusServiceClient client;

  _StatusProvider(){
    channel = ClientChannel('localhost',
        port: 8080,
        options:
        const ChannelOptions(credentials: ChannelCredentials.insecure()));
    client = StatusServiceClient(channel,
        options: CallOptions(timeout: Duration(seconds: 30)));
  }

  Future<String> runGetStatus() async {
    StatusResponse resp = await client.getStatus(StatusRequest());
    return resp.status;
  }
}

final statusProvider =  _StatusProvider();