import 'package:flutter_riverpod/legacy.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/network/dio_client.dart';
import '../data/auth_repository.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? json['phone'] ?? '',
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
    };
  }
}

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  final storage = ref.read(secureStorageProvider);
  return AuthController(repository, storage);
});

class AuthController extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final FlutterSecureStorage _storage;

  AuthController(this._repository, this._storage) : super(AuthState()) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _storage.read(key: AppConstants.keyAccessToken);
      if (token != null) {
        final email = await _storage.read(key: AppConstants.keyUserEmail);
        final id = await _storage.read(key: AppConstants.keyUserId);
        final name = await _storage.read(key: AppConstants.keyUserName);
        final phone = await _storage.read(key: AppConstants.keyUserPhone);
        final role = await _storage.read(key: AppConstants.keyUserRole);

        if (email != null && id != null && name != null) {
          state = AuthState(
            user: UserModel(
              id: id,
              name: name,
              email: email,
              phone: phone ?? '',
              role: role ?? 'user',
            ),
          );
          return;
        }
      }
      state = AuthState(user: null);
    } catch (e) {
      state = AuthState(error: e.toString());
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.login(email, password);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final accessToken = data['access_token'];
        final refreshToken = data['refresh_token'];
        final userData = data['user'];

        if (accessToken != null && refreshToken != null && userData != null) {
          final user = UserModel.fromJson(userData);

          await _storage.write(key: AppConstants.keyAccessToken, value: accessToken);
          await _storage.write(key: AppConstants.keyRefreshToken, value: refreshToken);
          await _storage.write(key: AppConstants.keyUserId, value: user.id);
          await _storage.write(key: AppConstants.keyUserName, value: user.name);
          await _storage.write(key: AppConstants.keyUserEmail, value: user.email);
          await _storage.write(key: AppConstants.keyUserPhone, value: user.phone);
          await _storage.write(key: AppConstants.keyUserRole, value: user.role);

          state = AuthState(user: user);
          return true;
        }
      }
      state = state.copyWith(isLoading: false, error: 'Invalid response from server.');
      return false;
    } catch (e) {
      String errorMessage = 'Login failed. Please check your credentials.';
      if (e is DioException && e.response != null && e.response!.data != null) {
        errorMessage = e.response!.data['detail'] ?? errorMessage;
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );
      if (response.statusCode == 200) {
        // Automatically attempt login after successful registration
        return await login(email, password);
      }
      state = state.copyWith(isLoading: false, error: 'Registration failed.');
      return false;
    } catch (e) {
      String errorMessage = 'Registration failed. Please try again.';
      if (e is DioException && e.response != null && e.response!.data != null) {
        errorMessage = e.response!.data['detail'] ?? errorMessage;
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    await _storage.delete(key: AppConstants.keyAccessToken);
    await _storage.delete(key: AppConstants.keyRefreshToken);
    await _storage.delete(key: AppConstants.keyUserId);
    await _storage.delete(key: AppConstants.keyUserName);
    await _storage.delete(key: AppConstants.keyUserEmail);
    await _storage.delete(key: AppConstants.keyUserPhone);
    await _storage.delete(key: AppConstants.keyUserRole);
    state = AuthState(user: null);
  }

  Future<bool> updateProfile(String name, String phone) async {
    if (state.user == null) return false;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.updateProfile(
        userId: state.user!.id,
        name: name,
        phone: phone,
      );
      if (response.statusCode == 200 && response.data != null) {
        final updatedUser = UserModel.fromJson(response.data);
        await _storage.write(key: AppConstants.keyUserName, value: updatedUser.name);
        await _storage.write(key: AppConstants.keyUserPhone, value: updatedUser.phone);
        state = AuthState(user: updatedUser);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Profile update failed.');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}
