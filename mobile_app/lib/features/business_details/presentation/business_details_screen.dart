import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'business_details_controller.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/business_details_repository.dart';

class BusinessDetailsScreen extends ConsumerStatefulWidget {
  final String businessId;

  const BusinessDetailsScreen({super.key, required this.businessId});

  @override
  ConsumerState<BusinessDetailsScreen> createState() => _BusinessDetailsScreenState();
}

class _BusinessDetailsScreenState extends ConsumerState<BusinessDetailsScreen> {
  final _reviewCommentController = TextEditingController();
  double _userRating = 5.0;
  final _leadPhoneController = TextEditingController();
  final _leadServiceController = TextEditingController();
  final _leadMessageController = TextEditingController();

  @override
  void dispose() {
    _reviewCommentController.dispose();
    _leadPhoneController.dispose();
    _leadServiceController.dispose();
    _leadMessageController.dispose();
    super.dispose();
  }

  void _submitReview() async {
    final comment = _reviewCommentController.text.trim();
    if (comment.isEmpty) return;

    final repo = ref.read(businessDetailsRepositoryProvider);
    final response = await repo.submitReview(
      businessId: widget.businessId,
      rating: _userRating,
      comment: comment,
    );

    if (mounted && response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Review submitted successfully!'),
          backgroundColor: Color(0xFF0D9488),
        ),
      );
      _reviewCommentController.clear();
      ref.invalidate(businessDetailsProvider(widget.businessId));
      ref.invalidate(businessReviewsProvider(widget.businessId));
    }
  }

  void _showLeadBottomSheet(Map<String, dynamic> business) {
    final user = ref.read(authControllerProvider).user;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to contact this business.')),
      );
      return;
    }

    _leadPhoneController.text = user.phone;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Inquire / Contact Business',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Send your contact info directly to ${business['businessName']}.',
                style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              // Phone Input
              TextField(
                controller: _leadPhoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Your Contact Phone',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
              ),
              const SizedBox(height: 12),
              // Service Required Input
              TextField(
                controller: _leadServiceController,
                decoration: const InputDecoration(
                  labelText: 'Service Required',
                  prefixIcon: Icon(Icons.settings_outlined),
                ),
              ),
              const SizedBox(height: 12),
              // Message Input
              TextField(
                controller: _leadMessageController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Your Message',
                  alignLabelWithHint: true,
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(bottom: 40.0),
                    child: Icon(Icons.chat_bubble_outline_rounded),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  final phone = _leadPhoneController.text.trim();
                  if (phone.isEmpty) return;

                  final repo = ref.read(businessDetailsRepositoryProvider);
                  try {
                    await repo.submitLead(
                      businessId: widget.businessId,
                      businessName: business['businessName'] ?? '',
                      customerName: user.name,
                      phone: phone,
                      email: user.email,
                      serviceRequired: _leadServiceController.text.trim(),
                      message: _leadMessageController.text.trim(),
                    );
                    if (mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Inquiry sent successfully!'),
                          backgroundColor: Color(0xFF0D9488),
                        ),
                      );
                      _leadServiceController.clear();
                      _leadMessageController.clear();
                    }
                  } catch (_) {}
                },
                child: const Text('Send Inquiry'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final detailsState = ref.watch(businessDetailsProvider(widget.businessId));
    final reviewsState = ref.watch(businessReviewsProvider(widget.businessId));
    final bookmarksState = ref.watch(bookmarkControllerProvider);
    final user = ref.watch(authControllerProvider).user;

    final isBookmarked = bookmarksState.bookmarkedIds.contains(widget.businessId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Partner Details'),
        actions: [
          if (user != null)
            IconButton(
              icon: Icon(
                isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_outline_rounded,
                color: isBookmarked ? const Color(0xFF1A56DB) : null,
              ),
              onPressed: () {
                ref.read(bookmarkControllerProvider.notifier).toggleBookmark(widget.businessId);
              },
            ),
        ],
      ),
      body: detailsState.when(
        data: (business) {
          final name = business['businessName'] ?? 'Business';
          final category = business['categoryName'] ?? '';
          final subcategory = business['subcategoryName'] ?? '';
          final rating = (business['rating'] ?? 0.0).toDouble();
          final reviewCount = business['reviewCount'] ?? 0;
          final description = business['description'] ?? '';
          final address = business['address'] ?? '';
          final city = business['city'] ?? '';
          final state = business['state'] ?? '';
          final phone = business['phone'] ?? '';
          final website = business['website'] ?? '';
          final logoUrl = business['logoUrl'] ?? '';
          final gallery = List<dynamic>.from(business['galleryImages'] ?? []);
          final services = List<dynamic>.from(business['services'] ?? []);

          return Stack(
            fit: StackFit.expand,
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 80),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image Banner / Gallery
                    _buildGalleryHeader(logoUrl, gallery),

                    Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category
                          Text(
                            category.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A56DB),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 4),

                          // Name
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),

                          // Subcategory
                          if (subcategory.isNotEmpty) ...[
                            Text(
                              subcategory,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 8),
                          ],

                          // Rating summary row
                          Row(
                            children: [
                              const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
                              const SizedBox(width: 4),
                              Text(
                                rating.toStringAsFixed(1),
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '($reviewCount reviews)',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                          const Divider(height: 32, color: Color(0xFFE2E8F0)),

                          // Contact Info Section
                          _buildSectionTitle('Location & Contact'),
                          const SizedBox(height: 8),
                          _buildContactRow(Icons.location_on_outlined, '$address, $city, $state'),
                          if (phone.isNotEmpty)
                            _buildContactRow(Icons.phone_outlined, phone),
                          if (website.isNotEmpty)
                            _buildContactRow(Icons.language_rounded, website),

                          const SizedBox(height: 24),

                          // Description
                          if (description.isNotEmpty) ...[
                            _buildSectionTitle('About'),
                            const SizedBox(height: 8),
                            Text(
                              description,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF475569),
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Services Offered
                          if (services.isNotEmpty) ...[
                            _buildSectionTitle('Services Offered'),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: services.map((svc) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFBFDBFE)),
                                  ),
                                  child: Text(
                                    svc.toString(),
                                    style: const TextStyle(
                                      color: Color(0xFF1E40AF),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Reviews Section
                          _buildSectionTitle('Reviews & Ratings'),
                          const SizedBox(height: 12),
                          _buildReviewInput(user),
                          const SizedBox(height: 16),
                          _buildReviewsList(reviewsState),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom Contact Floating Button
              Positioned(
                bottom: 16,
                left: 20,
                right: 20,
                child: ElevatedButton.icon(
                  onPressed: () => _showLeadBottomSheet(business),
                  icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white),
                  label: const Text('Contact Partner'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Text('Failed to load business details: $err', style: const TextStyle(color: Colors.red)),
        ),
      ),
    );
  }

  Widget _buildGalleryHeader(String logoUrl, List<dynamic> gallery) {
    final images = [if (logoUrl.isNotEmpty) logoUrl, ...gallery];
    if (images.isEmpty) {
      return Container(
        height: 180,
        width: double.infinity,
        color: const Color(0xFFE2E8F0),
        child: const Icon(Icons.store_rounded, size: 64, color: Color(0xFF94A3B8)),
      );
    }

    return SizedBox(
      height: 200,
      child: PageView.builder(
        itemCount: images.length,
        itemBuilder: (context, index) {
          return CachedNetworkImage(
            imageUrl: images[index],
            fit: BoxFit.cover,
            placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
            errorWidget: (context, url, error) => const Icon(Icons.image_not_supported_outlined),
          );
        },
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: const Color(0xFF64748B)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: Color(0xFF334155)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w800,
        color: Color(0xFF0F172A),
      ),
    );
  }

  Widget _buildReviewInput(UserModel? user) {
    if (user == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: const Text(
          'Please log in to submit a review.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Add a Review',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 12),
            // Star Selector
            Row(
              children: List.generate(5, (index) {
                final starValue = index + 1.0;
                return IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: Icon(
                    _userRating >= starValue ? Icons.star_rounded : Icons.star_border_rounded,
                    color: const Color(0xFFF59E0B),
                  ),
                  onPressed: () {
                    setState(() {
                      _userRating = starValue;
                    });
                  },
                );
              }),
            ),
            const SizedBox(height: 12),
            // Input comment
            TextField(
              controller: _reviewCommentController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Share your experience...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                onPressed: _submitReview,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(120, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                child: const Text('Submit'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsList(AsyncValue<List<dynamic>> reviewsState) {
    return reviewsState.when(
      data: (reviews) {
        if (reviews.isEmpty) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Text(
              'No reviews yet. Be the first to add one!',
              style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: reviews.length,
          itemBuilder: (context, index) {
            final r = reviews[index];
            final customerName = r['customerName'] ?? 'Anonymous User';
            final comment = r['comment'] ?? '';
            final ratingVal = (r['rating'] ?? 5.0).toDouble();

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          customerName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Row(
                          children: List.generate(5, (starIndex) {
                            return Icon(
                              starIndex < ratingVal ? Icons.star_rounded : Icons.star_border_rounded,
                              color: const Color(0xFFF59E0B),
                              size: 14,
                            );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      comment,
                      style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Text('Error loading reviews: $err', style: const TextStyle(color: Colors.red)),
    );
  }
}
