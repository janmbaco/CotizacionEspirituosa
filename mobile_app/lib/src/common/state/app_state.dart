import 'package:meta/meta.dart';
import 'package:mobile_app/src/common/state/pb.models.dart' as pb;

@immutable
class AppState {
  final bool isLoaded;
  final pb.Abstracts abstracts;
  final pb.Deliveries deliveries;
  final pb.Families families;
  final pb.Groups groups;
  final pb.Items items;
  final pb.Products products;
  final pb.ResultResponse serverResponse;
  final bool isErrorConnection;

  AppState({
    this.isLoaded = false,
    this.abstracts,
    this.deliveries,
    this.families,
    this.groups,
    this.items,
    this.products,
    this.serverResponse,
    this.isErrorConnection = false,
  });
}
