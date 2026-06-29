import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'search_controller.dart';
import '../../home/presentation/home_controller.dart';
import '../../home/presentation/widgets/business_card.dart';
import '../../business_details/presentation/business_details_screen.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _scrollController = ScrollController();
  final _queryController = TextEditingController();
  final _cityController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    
    // Set initial values from search controller state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = ref.read(searchControllerProvider);
      _queryController.text = state.query;
      if (state.city.isNotEmpty) {
        _cityController.text = state.city;
      }
      
      // If we don't have listings loaded, trigger an initial search
      if (state.listings.isEmpty && !state.isLoading) {
        ref.read(searchControllerProvider.notifier).executeSearch();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _queryController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      final notifier = ref.read(searchControllerProvider.notifier);
      final state = ref.read(searchControllerProvider);
      if (!state.isLoading) {
        notifier.executeSearch(reset: false);
      }
    }
  }

  void _triggerSearch() {
    final notifier = ref.read(searchControllerProvider.notifier);
    notifier.setParams(
      query: _queryController.text.trim(),
      city: _cityController.text.trim(),
    );
    notifier.executeSearch(reset: true);
  }

  void _onCategorySelect(String categoryId) {
    final notifier = ref.read(searchControllerProvider.notifier);
    final state = ref.read(searchControllerProvider);
    
    // Toggle category selection
    final newCatId = state.categoryId == categoryId ? '' : categoryId;
    notifier.setParams(categoryId: newCatId, subcategoryId: '');
    notifier.executeSearch(reset: true);
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchControllerProvider);
    final categoriesState = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Directory'),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all_rounded),
            tooltip: 'Clear Filters',
            onPressed: () {
              _queryController.clear();
              _cityController.clear();
              ref.read(searchControllerProvider.notifier).clearFilters();
              ref.read(searchControllerProvider.notifier).executeSearch();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Search Bar Controls
          _buildSearchControls(),

          // 2. Categories Horizontal Sub-filter
          _buildCategoryFilterRow(categoriesState, searchState),

          // 3. Results count
          if (!searchState.isLoading || searchState.listings.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  Text(
                    '${searchState.totalCount} Listings found',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),

          // 4. Results List
          Expanded(
            child: _buildResultsList(searchState),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchControls() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        children: [
          Row(
            children: [
              // City Field
              Expanded(
                flex: 2,
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextField(
                    controller: _cityController,
                    onSubmitted: (_) => _triggerSearch(),
                    decoration: const InputDecoration(
                      hintText: 'City',
                      prefixIcon: Icon(Icons.location_on_rounded, size: 18, color: Color(0xFF1A56DB)),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Search Query Field
              Expanded(
                flex: 3,
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextField(
                    controller: _queryController,
                    onSubmitted: (_) => _triggerSearch(),
                    decoration: const InputDecoration(
                      hintText: 'Keywords...',
                      prefixIcon: Icon(Icons.search_rounded, size: 18, color: Color(0xFF1A56DB)),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Search Action Button
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF1A56DB),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: IconButton(
                  icon: const Icon(Icons.tune_rounded, color: Colors.white, size: 20),
                  onPressed: _triggerSearch,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilterRow(AsyncValue<List<dynamic>> categoriesState, SearchState searchState) {
    return categoriesState.when(
      data: (categories) {
        if (categories.isEmpty) return const SizedBox.shrink();
        return Container(
          height: 48,
          color: Colors.white,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final cat = categories[index];
              final id = cat['id'] ?? cat['_id'] ?? '';
              final name = cat['name'] ?? '';
              final isSelected = searchState.categoryId == id;

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                child: ChoiceChip(
                  label: Text(
                    name,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : const Color(0xFF475569),
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (_) => _onCategorySelect(id),
                  selectedColor: const Color(0xFF1A56DB),
                  backgroundColor: const Color(0xFFF1F5F9),
                  side: BorderSide.none,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
              );
            },
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildResultsList(SearchState searchState) {
    if (searchState.listings.isEmpty) {
      if (searchState.isLoading) {
        return const Center(child: CircularProgressIndicator());
      }
      if (searchState.error != null) {
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Text(
              'Error loading results: ${searchState.error}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
          ),
        );
      }
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.store_rounded, size: 64, color: Color(0xFF94A3B8)),
            SizedBox(height: 12),
            Text(
              'No listings found.',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
            ),
            Text(
              'Try adjusting your search criteria.',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(searchControllerProvider.notifier).executeSearch(reset: true);
      },
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(20.0),
        itemCount: searchState.listings.length + (searchState.page < searchState.totalPages ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == searchState.listings.length) {
            return const Padding(
              padding: EdgeInsets.all(16.0),
              child: Center(child: CircularProgressIndicator()),
            );
          }

          final biz = searchState.listings[index];
          return BusinessCard(
            business: biz,
            onTap: () {
              final id = biz['id'] ?? biz['_id'] ?? '';
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => BusinessDetailsScreen(businessId: id),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
