import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'home_controller.dart';
import 'widgets/business_card.dart';
import '../../search/presentation/search_controller.dart';
import '../../business_details/presentation/business_details_screen.dart';
import 'package:cached_network_image/cached_network_image.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final Function(int)? onTabChange;

  const HomeScreen({super.key, this.onTabChange});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchController = TextEditingController();
  final _cityController = TextEditingController(); // default city
  int _currentBannerIndex = 0;

  @override
  void dispose() {
    _searchController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  void _onSearchSubmit() {
    final queryText = _searchController.text.trim();
    final cityText = _cityController.text.trim();
    
    // Set parameters in search controller and navigate to search tab
    ref.read(searchControllerProvider.notifier).clearFilters();
    ref.read(searchControllerProvider.notifier).setParams(
      query: queryText,
      city: cityText,
    );
    ref.read(searchControllerProvider.notifier).executeSearch();
    
    if (widget.onTabChange != null) {
      widget.onTabChange!(1); // Go to Search Screen tab
    }
  }

  void _onCategorySelect(String categoryId, String categoryName) {
    ref.read(searchControllerProvider.notifier).clearFilters();
    ref.read(searchControllerProvider.notifier).setParams(
      categoryId: categoryId,
    );
    ref.read(searchControllerProvider.notifier).executeSearch();
    
    if (widget.onTabChange != null) {
      widget.onTabChange!(1); // Go to Search Screen tab
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesState = ref.watch(categoriesProvider);
    final bannersState = ref.watch(bannersProvider);
    final featuredState = ref.watch(featuredBusinessesProvider);
    final statsState = ref.watch(publicStatsProvider);
    final quickServicesState = ref.watch(quickServicesProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(categoriesProvider);
            ref.invalidate(bannersProvider);
            ref.invalidate(featuredBusinessesProvider);
            ref.invalidate(publicStatsProvider);
            ref.invalidate(quickServicesProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Premium Glassmorphic Hero Banner & Search Panel
                _buildHeroBanner(bannersState),

                // 2. Statistics Grid
                _buildStatisticsGrid(statsState),

                // 3. Categories Horizontal List
                _buildCategoriesSection(categoriesState),

                // 4. Quick Services List (if seeded in DB)
                _buildQuickServicesSection(quickServicesState),

                // 5. Featured Listings Grid
                _buildFeaturedSection(featuredState),
                
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroBanner(AsyncValue<List<dynamic>> bannersState) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1E3A8A), Color(0xFF1D4ED8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Image.asset(
                  'assets/images/logo_light.png',
                  height: 36,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    // Fallback in case asset loading fails
                    return const Text(
                      'Right Ads',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.5,
                      ),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 24),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('No new notifications.')),
                    );
                  },
                ),
              ],
            ),
          ),
          // Banner slider or static background
          bannersState.when(
            data: (banners) {
              if (banners.isEmpty) return const SizedBox(height: 40);
              return Column(
                children: [
                  SizedBox(
                    height: 180,
                    child: PageView.builder(
                      onPageChanged: (index) {
                        setState(() {
                          _currentBannerIndex = index;
                        });
                      },
                      itemCount: banners.length,
                      itemBuilder: (context, index) {
                        final banner = banners[index];
                        final imageUrl = banner['imageUrl'] ?? '';
                        final title = banner['title'] ?? '';
                        final subtitle = banner['subtitle'] ?? '';

                        return Stack(
                          fit: StackFit.expand,
                          children: [
                            CachedNetworkImage(
                              imageUrl: imageUrl,
                              fit: BoxFit.cover,
                              errorWidget: (context, url, error) => Container(color: Colors.blueGrey),
                            ),
                            Container(
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [Colors.black54, Colors.transparent],
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 20,
                              bottom: 20,
                              right: 20,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    subtitle,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      banners.length,
                      (index) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3, vertical: 8),
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _currentBannerIndex == index ? Colors.white : Colors.white24,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
            loading: () => const SizedBox(
              height: 180,
              child: Center(child: CircularProgressIndicator(color: Colors.white)),
            ),
            error: (_, __) => const SizedBox(height: 40),
          ),

          // Search Inputs Card
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    // City Input
                    TextField(
                      controller: _cityController,
                      decoration: const InputDecoration(
                        hintText: 'Enter City (e.g. Mumbai, Delhi)',
                        prefixIcon: Icon(Icons.location_city_rounded, color: Color(0xFF1A56DB)),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),
                    // Keyword Input
                    TextField(
                      controller: _searchController,
                      onSubmitted: (_) => _onSearchSubmit(),
                      decoration: const InputDecoration(
                        hintText: 'Search services, shops, salons...',
                        prefixIcon: Icon(Icons.search_rounded, color: Color(0xFF1A56DB)),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _onSearchSubmit,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 44),
                      ),
                      child: const Text('Search Listings'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsGrid(AsyncValue<Map<String, dynamic>> statsState) {
    return statsState.when(
      data: (stats) {
        if (stats.isEmpty) return const SizedBox.shrink();
        final listings = stats['listingsCount']?.toString() ?? '0';
        final verified = stats['verifiedCount']?.toString() ?? '0 +';
        final categories = stats['categoriesCount']?.toString() ?? '0 +';
        final rating = stats['avgRating']?.toString() ?? '4.8 ★';

        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStatItem('Listings', listings, Icons.storefront_rounded),
              _buildStatItem('Verified', verified, Icons.verified_user_rounded),
              _buildStatItem('Categories', categories, Icons.category_rounded),
              _buildStatItem('Rating', rating, Icons.star_rounded),
            ],
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: const Color(0xFFEFF6FF),
          child: Icon(icon, size: 18, color: const Color(0xFF1A56DB)),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildCategoriesSection(AsyncValue<List<dynamic>> categoriesState) {
    return categoriesState.when(
      data: (categories) {
        if (categories.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Text(
                'Browse Categories',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
            ),
            SizedBox(
              height: 40,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: categories.length,
                itemBuilder: (context, index) {
                  final cat = categories[index];
                  final name = cat['name'] ?? 'Category';
                  final id = cat['id'] ?? cat['_id'] ?? '';
                  final colorHex = cat['color'] ?? '#1A56DB';
                  
                  // Convert HEX to color
                  Color catColor = const Color(0xFF1A56DB);
                  try {
                    final cleanHex = colorHex.replaceAll('#', '');
                    catColor = Color(int.parse('FF$cleanHex', radix: 16));
                  } catch (_) {}

                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: ActionChip(
                      onPressed: () => _onCategorySelect(id, name),
                      backgroundColor: Colors.white,
                      surfaceTintColor: Colors.white,
                      side: BorderSide(color: catColor.withOpacity(0.3), width: 1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      label: Text(
                        name,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: catColor,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
      loading: () => const Padding(
        padding: EdgeInsets.all(20.0),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildQuickServicesSection(AsyncValue<List<dynamic>> servicesState) {
    return servicesState.when(
      data: (services) {
        if (services.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 20, 20, 10),
              child: Text(
                'Quick Services',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
            ),
            SizedBox(
              height: 100,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: services.length,
                itemBuilder: (context, index) {
                  final svc = services[index];
                  final name = svc['name'] ?? 'Service';
                  final id = svc['subcategoryId'] ?? '';

                  return GestureDetector(
                    onTap: () {
                      ref.read(searchControllerProvider.notifier).clearFilters();
                      ref.read(searchControllerProvider.notifier).setParams(
                        subcategoryId: id,
                      );
                      ref.read(searchControllerProvider.notifier).executeSearch();
                      if (widget.onTabChange != null) {
                        widget.onTabChange!(1);
                      }
                    },
                    child: Container(
                      width: 80,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const CircleAvatar(
                            radius: 24,
                            backgroundColor: Color(0xFFF1F5F9),
                            child: Icon(Icons.construction_rounded, color: Color(0xFF475569)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            name,
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildFeaturedSection(AsyncValue<List<dynamic>> featuredState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
          child: Text(
            'Featured Partners',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
          ),
        ),
        featuredState.when(
          data: (businesses) {
            if (businesses.isEmpty) {
              return const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text('No featured partners found.', style: TextStyle(color: Color(0xFF64748B))),
              );
            }

            return ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: businesses.length,
              itemBuilder: (context, index) {
                final biz = businesses[index];
                return BusinessCard(
                  business: biz,
                  onTap: () {
                    final id = biz['_id'] ?? biz['id'] ?? '';
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => BusinessDetailsScreen(businessId: id),
                      ),
                    );
                  },
                );
              },
            );
          },
          loading: () => const Padding(
            padding: EdgeInsets.all(20.0),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (err, stack) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text('Failed to load featured partners: $err', style: const TextStyle(color: Colors.red)),
          ),
        ),
      ],
    );
  }
}
