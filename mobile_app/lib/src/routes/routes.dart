import 'package:flutter/material.dart';
import 'package:mobile_app/src/pages/home_page.dart';

Map<String, WidgetBuilder> getApplicationsRoutes() =>
    <String, WidgetBuilder>{
      '/' : (BuildContext context) => HomePage(),
    };