import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // Base URL resolution
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    }
    if (Platform.isAndroid) {
      // 10.0.2.2 points to host localhost in Android Emulator
      return 'http://10.0.2.2:3000';
    }
    // Windows, macOS, Linux, iOS
    return 'http://localhost:3000';
  }

  // Auth endpoints
  static String get loginUrl => '$baseUrl/api/auth/login';
  static String get registerUrl => '$baseUrl/api/auth/register';
  static String get meUrl => '$baseUrl/api/auth/me';
  static String get profileUrl => '$baseUrl/api/users/profile';
  static String get aiUrl => '$baseUrl/api/ai';
  static String get chatUrl => '$baseUrl/api/chat/send';
}
