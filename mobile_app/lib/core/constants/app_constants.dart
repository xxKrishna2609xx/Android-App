import 'package:flutter/foundation.dart';

class AppConstants {
  // Use 10.0.2.2 for Android emulator to connect to localhost, and 127.0.0.1 for other platforms
  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    }
    // Android emulator loopback IP
    return 'http://10.0.2.2:8000/api';
  }

  static const String appName = 'Right Ads Digital';
  static const String contactEmail = 'support@rightadsdigital.com';
  static const String contactPhone = '+91 98765 00000';
  static const String contactAddress = '14, Business Hub, Sector 21, Mumbai, Maharashtra 400001';

  // Secure storage keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserEmail = 'user_email';
  static const String keyUserRole = 'user_role';
  static const String keyUserName = 'user_name';
  static const String keyUserId = 'user_id';
  static const String keyUserPhone = 'user_phone';
}
