import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  final dio = ref.read(dioProvider);
  return SearchRepository(dio);
});

class SearchRepository {
  final Dio _dio;

  SearchRepository(this._dio);

  Future<Response> search({
    String query = '',
    String city = '',
    String categoryId = '',
    String subcategoryId = '',
    int page = 1,
    int limit = 10,
  }) async {
    return await _dio.get('/search', queryParameters: {
      'query': query,
      'city': city,
      'categoryId': categoryId,
      'subcategoryId': subcategoryId,
      'page': page,
      'limit': limit,
    });
  }
}
