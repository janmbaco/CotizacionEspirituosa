import 'package:grpc/grpc.dart';

typedef S ClientCreator<S extends Client>(ClientChannel channel);

class ClientProvider {
  final ClientChannel _channel;

  ClientProvider(String host, int port, ChannelOptions options)
      : _channel = ClientChannel(host, port: port, options: options);

  T getClient<T extends Client>(ClientCreator<T> creator) {
    return creator(this._channel);
  }
}
