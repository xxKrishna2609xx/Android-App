import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.read(dioProvider);
  return AuthRepository(dio);
});

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<Response> login(String email, String password) async {
    return await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    return await _dio.post('/auth/register', data: {
      'name': name,
      'email': email,
      'phone': phone,
      'password': password,
    });
  }

  Future<Response> getMe() async {
    return await _dio.get('/me');
  }

  Future<Response> updateProfile({
    required String userId,
    required String name,
    required String phone,
  }) async {
    return await _dio.put('/users/$userId', data: {
      'name': name,
      'phone': phone,
    });
  }
}
