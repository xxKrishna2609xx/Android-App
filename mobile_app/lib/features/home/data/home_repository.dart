import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  final dio = ref.read(dioProvider);
  return HomeRepository(dio);
});

class HomeRepository {
  final Dio _dio;

  HomeRepository(this._dio);

  Future<Response> getCategories() async {
    return await _dio.get('/categories');
  }

  Future<Response> getSubcategories() async {
    return await _dio.get('/subcategories');
  }

  Future<Response> getFeaturedBusinesses() async {
    return await _dio.get('/businesses/featured');
  }

  Future<Response> getBanners() async {
    return await _dio.get('/banners');
  }

  Future<Response> getPublicStats() async {
    return await _dio.get('/public-stats');
  }

  Future<Response> getQuickServices() async {
    return await _dio.get('/quick-services');
  }
}
