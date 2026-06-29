import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_constants.dart';

// Provider for FlutterSecureStorage
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
});

// Provider for Dio network client
final dioProvider = Provider<Dio>((ref) {
  final storage = ref.read(secureStorageProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      contentType: Headers.jsonContentType,
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: AppConstants.keyAccessToken);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        // If 401 (Unauthorized) occurs, attempt token refresh
        if (error.response?.statusCode == 401) {
          final refreshToken = await storage.read(key: AppConstants.keyRefreshToken);
          if (refreshToken != null) {
            try {
              // Create a clean Dio instance to avoid interceptor recursion loop
              final refreshDio = Dio(
                BaseOptions(
                  baseUrl: AppConstants.apiBaseUrl,
                  contentType: Headers.jsonContentType,
                ),
              );

              final response = await refreshDio.post(
                '/auth/refresh',
                data: {
                  'refresh_token': refreshToken,
                },
              );

              if (response.statusCode == 200 && response.data != null) {
                final newAccessToken = response.data['access_token'];
                if (newAccessToken != null) {
                  await storage.write(
                    key: AppConstants.keyAccessToken,
                    value: newAccessToken,
                  );

                  // Update header and retry the original failed request
                  error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                  
                  final retryResponse = await dio.fetch(error.requestOptions);
                  return handler.resolve(retryResponse);
                }
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens and let application handle logout
              await storage.delete(key: AppConstants.keyAccessToken);
              await storage.delete(key: AppConstants.keyRefreshToken);
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
