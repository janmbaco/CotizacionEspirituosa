import 'package:meta/meta.dart';
import 'package:mobile_app/src/common/state/pb.models.dart' as pb;

@immutable
class AppState {
  final bool isLoading;
  final pb.Abstracts abstracts;
  final pb.Deliveries deliveries;
  final pb.Families families;
  final pb.Groups groups;
  final pb.Items items;
  final pb.Products products;
  final pb.ResultResponse serverResponse;

  AppState(
      {this.isLoading = false,
      this.abstracts,
      this.deliveries,
      this.families,
      this.groups,
      this.items,
      this.products,
      this.serverResponse});

  factory AppState.loading() => AppState(isLoading: true);
}
