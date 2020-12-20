import 'package:flutter/material.dart';
import 'package:mobile_app/src/common/widgets/home_widget.dart';

Map<String, WidgetBuilder> getApplicationsRoutes() =>
    <String, WidgetBuilder>{
      '/': (BuildContext context) => HomeWidget(),
    };