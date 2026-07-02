import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';
import 'dashboard_controller.dart';
import '../data/dashboard_repository.dart';
import '../../home/presentation/widgets/business_card.dart';
import '../../business_details/presentation/business_details_screen.dart';
import 'apply_business_screen.dart';

class UserDashboardScreen extends ConsumerWidget {
  const UserDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.user;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('User Dashboard')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.account_circle_outlined, size: 64, color: Color(0xFF94A3B8)),
              const SizedBox(height: 12),
              const Text(
                'Please sign in to view your dashboard.',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                  );
                },
                child: const Text('Go to Login'),
              ),
            ],
          ),
        ),
      );
    }

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Welcome, ${user.name}'),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
              tooltip: 'Sign Out',
              onPressed: () {
                ref.read(authControllerProvider.notifier).logout();
              },
            ),
          ],
          bottom: const TabBar(
            indicatorColor: Color(0xFF1A56DB),
            labelColor: Color(0xFF1A56DB),
            unselectedLabelColor: Color(0xFF64748B),
            tabs: [
              Tab(icon: Icon(Icons.bookmark_rounded), text: 'Saved'),
              Tab(icon: Icon(Icons.description_rounded), text: 'Applications'),
              Tab(icon: Icon(Icons.business_rounded), text: 'My Businesses'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildSavedListingsTab(ref),
            _buildApplicationsTab(context, ref, user),
            _buildMyBusinessesTab(ref),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const ApplyBusinessScreen()),
            );
          },
          backgroundColor: const Color(0xFF1A56DB),
          foregroundColor: Colors.white,
          icon: const Icon(Icons.add_business_rounded),
          label: const Text('Add Business'),
        ),
      ),
    );
  }

  Widget _buildSavedListingsTab(WidgetRef ref) {
    final bookmarkedState = ref.watch(bookmarkedBusinessesProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(bookmarkedBusinessesProvider);
      },
      child: bookmarkedState.when(
        data: (businesses) {
          if (businesses.isEmpty) {
            return const Center(
              child: Text(
                'No saved listings yet.',
                style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
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
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildApplicationsTab(BuildContext context, WidgetRef ref, dynamic user) {
    final applicationsState = ref.watch(myApplicationsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myApplicationsProvider);
      },
      child: applicationsState.when(
        data: (applications) {
          if (applications.isEmpty) {
            return const Center(
              child: Text(
                'No applications found.',
                style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: applications.length,
            itemBuilder: (context, index) {
              final app = applications[index];
              final name = app['businessName'] ?? '';
              final date = app['createdAt'] ?? '';
              final status = app['status'] ?? 'PENDING';
              final reason = app['rejectReason'] ?? '';

              Color statusColor = const Color(0xFFF59E0B);
              if (status == 'APPROVED') statusColor = const Color(0xFF10B981);
              if (status == 'REJECTED') statusColor = const Color(0xFFEF4444);

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              status,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: statusColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Submitted on: ${date.substring(0, 10)}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                      if (status == 'REJECTED' && reason.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red.withOpacity(0.1)),
                          ),
                          child: Text(
                            'Reason: $reason',
                            style: const TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ),
                      ],
                      if (user?.role == 'admin' && status == 'PENDING') ...[
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton(
                              onPressed: () => _rejectApplication(context, ref, app['id'] ?? app['_id'] ?? ''),
                              style: TextButton.styleFrom(foregroundColor: Colors.red),
                              child: const Text('Reject'),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () => _approveApplication(context, ref, app['id'] ?? app['_id'] ?? ''),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              child: const Text('Approve'),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildMyBusinessesTab(WidgetRef ref) {
    final businessesState = ref.watch(myBusinessesProvider);
    final leadsState = ref.watch(myBusinessLeadsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myBusinessesProvider);
        ref.invalidate(myBusinessLeadsProvider);
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'My Listings',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            businessesState.when(
              data: (businesses) {
                if (businesses.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text(
                      'You do not own any approved business listings.',
                      style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
                    ),
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
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
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Text('Error: $err'),
            ),
            const Divider(height: 40),
            const Text(
              'Received Inquiries (Leads)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            leadsState.when(
              data: (leads) {
                if (leads.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text(
                      'No inquiries received yet.',
                      style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
                    ),
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: leads.length,
                  itemBuilder: (context, index) {
                    final lead = leads[index];
                    final customerName = lead['customerName'] ?? '';
                    final phone = lead['phone'] ?? '';
                    final email = lead['email'] ?? '';
                    final service = lead['serviceRequired'] ?? '';
                    final message = lead['message'] ?? '';
                    final date = lead['createdAt'] ?? '';
                    final businessName = lead['businessName'] ?? '';

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  customerName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                Text(
                                  date.substring(0, 10),
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Listing: $businessName',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1A56DB)),
                            ),
                            const SizedBox(height: 8),
                            if (service.isNotEmpty) ...[
                              Text('Service: $service', style: const TextStyle(fontSize: 12)),
                              const SizedBox(height: 4),
                            ],
                            if (message.isNotEmpty) ...[
                              Text('Message: "$message"', style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Color(0xFF475569))),
                              const SizedBox(height: 8),
                            ],
                            Row(
                              children: [
                                const Icon(Icons.phone, size: 12, color: Color(0xFF64748B)),
                                const SizedBox(width: 4),
                                Text(phone, style: const TextStyle(fontSize: 12)),
                                if (email.isNotEmpty) ...[
                                  const SizedBox(width: 16),
                                  const Icon(Icons.email, size: 12, color: Color(0xFF64748B)),
                                  const SizedBox(width: 4),
                                  Text(email, style: const TextStyle(fontSize: 12)),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Text('Error: $err'),
            ),
          ],
        ),
      ),
    );
  }

  void _approveApplication(BuildContext context, WidgetRef ref, String id) async {
    try {
      final repo = ref.read(dashboardRepositoryProvider);
      final response = await repo.approveApplication(id);
      if (response.statusCode == 200) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Application approved successfully!'), backgroundColor: Colors.green),
          );
        }
        ref.invalidate(myApplicationsProvider);
        ref.invalidate(myBusinessesProvider);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to approve application: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _rejectApplication(BuildContext context, WidgetRef ref, String id) async {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Application'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            labelText: 'Reason for rejection',
            hintText: 'Enter reason...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final reason = reasonController.text.trim();
              if (reason.isEmpty) return;
              Navigator.of(context).pop();
              try {
                final repo = ref.read(dashboardRepositoryProvider);
                final response = await repo.rejectApplication(id, reason);
                if (response.statusCode == 200) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Application rejected!'), backgroundColor: Colors.orange),
                    );
                  }
                  ref.invalidate(myApplicationsProvider);
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to reject application: $e'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }
}
