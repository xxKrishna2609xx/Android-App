import 'package:flutter_riverpod/legacy.dart';
import '../data/search_repository.dart';

class SearchState {
  final String query;
  final String city;
  final String categoryId;
  final String subcategoryId;
  final List<dynamic> listings;
  final bool isLoading;
  final int page;
  final int totalPages;
  final int totalCount;
  final String? error;

  SearchState({
    this.query = '',
    this.city = '',
    this.categoryId = '',
    this.subcategoryId = '',
    this.listings = const [],
    this.isLoading = false,
    this.page = 1,
    this.totalPages = 1,
    this.totalCount = 0,
    this.error,
  });

  SearchState copyWith({
    String? query,
    String? city,
    String? categoryId,
    String? subcategoryId,
    List<dynamic>? listings,
    bool? isLoading,
    int? page,
    int? totalPages,
    int? totalCount,
    String? error,
  }) {
    return SearchState(
      query: query ?? this.query,
      city: city ?? this.city,
      categoryId: categoryId ?? this.categoryId,
      subcategoryId: subcategoryId ?? this.subcategoryId,
      listings: listings ?? this.listings,
      isLoading: isLoading ?? this.isLoading,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      totalCount: totalCount ?? this.totalCount,
      error: error ?? this.error,
    );
  }
}

final searchControllerProvider = StateNotifierProvider<SearchController, SearchState>((ref) {
  final repo = ref.read(searchRepositoryProvider);
  return SearchController(repo);
});

class SearchController extends StateNotifier<SearchState> {
  final SearchRepository _repository;

  SearchController(this._repository) : super(SearchState());

  void setParams({
    String? query,
    String? city,
    String? categoryId,
    String? subcategoryId,
  }) {
    state = state.copyWith(
      query: query ?? state.query,
      city: city ?? state.city,
      categoryId: categoryId ?? state.categoryId,
      subcategoryId: subcategoryId ?? state.subcategoryId,
    );
  }

  Future<void> executeSearch({bool reset = true}) async {
    final targetPage = reset ? 1 : state.page + 1;
    if (reset) {
      state = state.copyWith(listings: [], isLoading: true, error: null);
    } else {
      if (state.page >= state.totalPages) return; // No more pages
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final response = await _repository.search(
        query: state.query,
        city: state.city,
        categoryId: state.categoryId,
        subcategoryId: state.subcategoryId,
        page: targetPage,
        limit: 10,
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final list = List<dynamic>.from(data['data'] ?? []);
        final totalPages = data['totalPages'] ?? 1;
        final totalCount = data['total'] ?? 0;

        state = state.copyWith(
          listings: reset ? list : [...state.listings, ...list],
          page: targetPage,
          totalPages: totalPages,
          totalCount: totalCount,
          isLoading: false,
        );
      } else {
        state = state.copyWith(isLoading: false, error: 'Search failed.');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void clearFilters() {
    state = SearchState();
  }
}
