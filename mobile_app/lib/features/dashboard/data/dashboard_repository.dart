import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  final dio = ref.read(dioProvider);
  return DashboardRepository(dio);
});

class DashboardRepository {
  final Dio _dio;

  DashboardRepository(this._dio);

  Future<Response> getMyBusinesses() async {
    return await _dio.get('/my-businesses');
  }

  Future<Response> getMyApplications(String email) async {
    return await _dio.get('/applications/user/$email');
  }

  Future<Response> getMyBusinessLeads(String email) async {
    return await _dio.get('/my-business-leads/$email');
  }

  Future<Response> applyForBusiness(Map<String, dynamic> applicationData) async {
    return await _dio.post('/business/apply', data: applicationData);
  }

  Future<Response> updateBusiness(String businessId, Map<String, dynamic> businessData) async {
    return await _dio.put('/business/$businessId', data: businessData);
  }

  Future<Response> uploadImage(MultipartFile imageFile) async {
    final formData = FormData.fromMap({
      'file': imageFile,
    });
    return await _dio.post('/upload', data: formData);
  }
}
