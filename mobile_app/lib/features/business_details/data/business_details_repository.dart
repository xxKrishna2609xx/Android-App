import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final businessDetailsRepositoryProvider = Provider<BusinessDetailsRepository>((ref) {
  final dio = ref.read(dioProvider);
  return BusinessDetailsRepository(dio);
});

class BusinessDetailsRepository {
  final Dio _dio;

  BusinessDetailsRepository(this._dio);

  Future<Response> getBusinessDetails(String id) async {
    return await _dio.get('/businesses/$id');
  }

  Future<Response> getReviews(String businessId) async {
    return await _dio.get('/reviews/$businessId');
  }

  Future<Response> submitReview({
    required String businessId,
    required double rating,
    required String comment,
  }) async {
    return await _dio.post('/reviews', data: {
      'businessId': businessId,
      'rating': rating,
      'comment': comment,
    });
  }

  Future<Response> submitLead({
    required String businessId,
    required String businessName,
    required String customerName,
    required String phone,
    required String email,
    required String serviceRequired,
    required String message,
  }) async {
    return await _dio.post('/leads', data: {
      'businessId': businessId,
      'businessName': businessName,
      'customerName': customerName,
      'phone': phone,
      'email': email,
      'serviceRequired': serviceRequired,
      'message': message,
    });
  }

  Future<Response> addBookmark({
    required String userId,
    required String businessId,
  }) async {
    return await _dio.post('/bookmarks', data: {
      'userId': userId,
      'businessId': businessId,
    });
  }

  Future<Response> removeBookmark({
    required String userId,
    required String businessId,
  }) async {
    return await _dio.delete('/bookmarks/$userId/$businessId');
  }

  Future<Response> getBookmarks(String userId) async {
    return await _dio.get('/bookmarks/$userId');
  }
}
