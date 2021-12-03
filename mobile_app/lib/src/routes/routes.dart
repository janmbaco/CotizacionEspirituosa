import 'package:flutter/material.dart';
import 'package:mobile_app/src/features/abstracts/screens/abstracts_screen.dart';

Map<String, WidgetBuilder> getApplicationsRoutes() =>
    <String, WidgetBuilder>{
      '/': (BuildContext context) => AbstractsScreen(),
    };