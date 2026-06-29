import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/business_details_repository.dart';

final businessDetailsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final repo = ref.read(businessDetailsRepositoryProvider);
  final response = await repo.getBusinessDetails(id);
  if (response.statusCode == 200 && response.data != null) {
    return Map<String, dynamic>.from(response.data);
  }
  throw Exception('Failed to load business details');
});

final businessReviewsProvider = FutureProvider.family<List<dynamic>, String>((ref, businessId) async {
  final repo = ref.read(businessDetailsRepositoryProvider);
  final response = await repo.getReviews(businessId);
  if (response.statusCode == 200 && response.data != null) {
    return List<dynamic>.from(response.data);
  }
  return [];
});

// Bookmark Controller: Manages bookmark list for current user
class BookmarkListState {
  final List<String> bookmarkedIds;
  final bool isLoading;

  BookmarkListState({this.bookmarkedIds = const [], this.isLoading = false});

  BookmarkListState copyWith({List<String>? bookmarkedIds, bool? isLoading}) {
    return BookmarkListState(
      bookmarkedIds: bookmarkedIds ?? this.bookmarkedIds,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

final bookmarkControllerProvider = StateNotifierProvider<BookmarkController, BookmarkListState>((ref) {
  final repo = ref.read(businessDetailsRepositoryProvider);
  final auth = ref.watch(authControllerProvider);
  return BookmarkController(repo, auth.user?.id);
});

class BookmarkController extends StateNotifier<BookmarkListState> {
  final BusinessDetailsRepository _repository;
  final String? _userId;

  BookmarkController(this._repository, this._userId) : super(BookmarkListState()) {
    loadBookmarks();
  }

  Future<void> loadBookmarks() async {
    if (_userId == null) return;
    state = state.copyWith(isLoading: true);
    try {
      final response = await _repository.getBookmarks(_userId!);
      if (response.statusCode == 200 && response.data != null) {
        final list = List<dynamic>.from(response.data);
        final ids = list.map((item) => item['businessId']?.toString() ?? '').toList();
        state = BookmarkListState(bookmarkedIds: ids, isLoading: false);
      }
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> toggleBookmark(String businessId) async {
    if (_userId == null) return false;
    final isBookmarked = state.bookmarkedIds.contains(businessId);
    
    try {
      if (isBookmarked) {
        final response = await _repository.removeBookmark(userId: _userId!, businessId: businessId);
        if (response.statusCode == 200) {
          state = state.copyWith(
            bookmarkedIds: state.bookmarkedIds.where((id) => id != businessId).toList(),
          );
          return true;
        }
      } else {
        final response = await _repository.addBookmark(userId: _userId!, businessId: businessId);
        if (response.statusCode == 200) {
          state = state.copyWith(
            bookmarkedIds: [...state.bookmarkedIds, businessId],
          );
          return true;
        }
      }
    } catch (_) {}
    return false;
  }
}
