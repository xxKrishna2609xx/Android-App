import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/home_repository.dart';

final categoriesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(homeRepositoryProvider);
  final response = await repo.getCategories();
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

final subcategoriesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(homeRepositoryProvider);
  final response = await repo.getSubcategories();
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

final bannersProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(homeRepositoryProvider);
  final response = await repo.getBanners();
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

final featuredBusinessesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(homeRepositoryProvider);
  final response = await repo.getFeaturedBusinesses();
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

final publicStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repo = ref.read(homeRepositoryProvider);
  final response = await repo.getPublicStats();
  if (response.statusCode == 200 && response.data != null) {
    return Map<String, dynamic>.from(response.data);
  }
  return {};
});

final quickServicesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.read(homeRepositoryProvider);
  final response = await repo.getQuickServices();
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});
