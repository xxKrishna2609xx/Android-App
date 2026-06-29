import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../business_details/presentation/business_details_controller.dart';
import '../../business_details/data/business_details_repository.dart';
import '../data/dashboard_repository.dart';

final myBusinessesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(dashboardRepositoryProvider);
  final userState = ref.watch(authControllerProvider);
  if (userState.user == null) return [];
  
  final Response response;
  if (userState.user!.role == 'admin') {
    response = await repo.getAllBusinesses();
  } else {
    response = await repo.getMyBusinesses();
  }
  
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

final myApplicationsProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(dashboardRepositoryProvider);
  final userState = ref.watch(authControllerProvider);
  if (userState.user == null) return [];
  
  final Response response;
  if (userState.user!.role == 'admin') {
    response = await repo.getAdminApplications();
  } else {
    response = await repo.getMyApplications(userState.user!.email);
  }
  
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

final myBusinessLeadsProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(dashboardRepositoryProvider);
  final userState = ref.watch(authControllerProvider);
  if (userState.user == null) return [];
  
  final Response response;
  if (userState.user!.role == 'admin') {
    response = await repo.getAllLeads();
  } else {
    response = await repo.getMyBusinessLeads(userState.user!.email);
  }
  
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

// Fetches full details for all bookmarked businesses
final bookmarkedBusinessesProvider = FutureProvider<List<dynamic>>((ref) async {
  final bookmarkState = ref.watch(bookmarkControllerProvider);
  final detailsRepo = ref.read(businessDetailsRepositoryProvider);
  
  if (bookmarkState.bookmarkedIds.isEmpty) return [];
  
  final futures = bookmarkState.bookmarkedIds.map((id) async {
    try {
      final response = await detailsRepo.getBusinessDetails(id);
      if (response.statusCode == 200) return response.data;
    } catch (_) {}
    return null;
  });
  
  final results = await Future.wait(futures);
  return results.where((item) => item != null).toList();
});
