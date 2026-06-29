import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../home/presentation/home_controller.dart';
import '../data/dashboard_repository.dart';
import 'dashboard_controller.dart';

class ApplyBusinessScreen extends ConsumerStatefulWidget {
  const ApplyBusinessScreen({super.key});

  @override
  ConsumerState<ApplyBusinessScreen> createState() => _ApplyBusinessScreenState();
}

class _ApplyBusinessScreenState extends ConsumerState<ApplyBusinessScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Form fields state
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _phoneController = TextEditingController();
  final _websiteController = TextEditingController();
  final _servicesController = TextEditingController();

  String? _selectedCategoryId;
  String? _selectedCategoryName;
  String? _selectedSubcategoryId;
  String? _selectedSubcategoryName;
  final List<String> _servicesList = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authControllerProvider).user;
      if (user != null) {
        _phoneController.text = user.phone;
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _phoneController.dispose();
    _websiteController.dispose();
    _servicesController.dispose();
    super.dispose();
  }

  void _addService() {
    final svc = _servicesController.text.trim();
    if (svc.isNotEmpty && !_servicesList.contains(svc)) {
      setState(() {
        _servicesList.add(svc);
        _servicesController.clear();
      });
    }
  }

  void _removeService(String svc) {
    setState(() {
      _servicesList.remove(svc);
    });
  }

  void _submitApplication() async {
    if (!_formKey.currentState!.validate() || _selectedCategoryId == null || _selectedSubcategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select Category and Subcategory.')),
      );
      return;
    }

    final user = ref.read(authControllerProvider).user;
    if (user == null) return;

    final repo = ref.read(dashboardRepositoryProvider);
    final applicationData = {
      'ownerName': user.name,
      'email': user.email,
      'phone': _phoneController.text.trim(),
      'businessName': _nameController.text.trim(),
      'categoryId': _selectedCategoryId,
      'subcategoryId': _selectedSubcategoryId,
      'categoryName': _selectedCategoryName,
      'subcategoryName': _selectedSubcategoryName,
      'address': _addressController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      'website': _websiteController.text.trim(),
      'description': _descController.text.trim(),
      'logoUrl': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', // Default premium fallback
      'socialMediaLinks': {},
      'galleryImages': [],
      'services': _servicesList,
    };

    try {
      final response = await repo.applyForBusiness(applicationData);
      if (response.statusCode == 200 && mounted) {
        ref.invalidate(myApplicationsProvider);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Application submitted successfully!'),
            backgroundColor: Color(0xFF0D9488),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit application: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesState = ref.watch(categoriesProvider);
    final subcategoriesState = ref.watch(subcategoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Apply for Business Listing'),
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          type: StepperType.horizontal,
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 2) {
              setState(() => _currentStep += 1);
            } else {
              _submitApplication();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep -= 1);
            } else {
              Navigator.pop(context);
            }
          },
          steps: [
            Step(
              title: const Text('Details'),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.editing,
              content: Column(
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Business Name'),
                    validator: (val) => val == null || val.isEmpty ? 'Enter business name' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _descController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Description'),
                  ),
                  const SizedBox(height: 16),
                  
                  // Category Dropdown
                  categoriesState.when(
                    data: (categories) {
                      return DropdownButtonFormField<String>(
                        decoration: const InputDecoration(labelText: 'Category'),
                        value: _selectedCategoryId,
                        items: categories.map((cat) {
                          return DropdownMenuItem<String>(
                            value: cat['id'] ?? cat['_id']?.toString(),
                            child: Text(cat['name'] ?? ''),
                          );
                        }).toList(),
                        onChanged: (val) {
                          final selected = categories.firstWhere((cat) => (cat['id'] ?? cat['_id']?.toString()) == val);
                          setState(() {
                            _selectedCategoryId = val;
                            _selectedCategoryName = selected['name'];
                            // Reset subcategory selection when category changes
                            _selectedSubcategoryId = null;
                            _selectedSubcategoryName = null;
                          });
                        },
                      );
                    },
                    loading: () => const CircularProgressIndicator(),
                    error: (_, __) => const Text('Error loading categories'),
                  ),
                  const SizedBox(height: 16),

                  // Subcategory Dropdown
                  subcategoriesState.when(
                    data: (subcategories) {
                      // Filter subcategories for the selected category
                      final filtered = subcategories.where((sub) => sub['categoryId']?.toString() == _selectedCategoryId).toList();
                      return DropdownButtonFormField<String>(
                        decoration: const InputDecoration(labelText: 'Subcategory'),
                        value: _selectedSubcategoryId,
                        disabledHint: const Text('Select a category first'),
                        items: filtered.map((sub) {
                          return DropdownMenuItem<String>(
                            value: sub['id'] ?? sub['_id']?.toString(),
                            child: Text(sub['name'] ?? ''),
                          );
                        }).toList(),
                        onChanged: _selectedCategoryId == null ? null : (val) {
                          final selected = filtered.firstWhere((sub) => (sub['id'] ?? sub['_id']?.toString()) == val);
                          setState(() {
                            _selectedSubcategoryId = val;
                            _selectedSubcategoryName = selected['name'];
                          });
                        },
                      );
                    },
                    loading: () => const CircularProgressIndicator(),
                    error: (_, __) => const Text('Error loading subcategories'),
                  ),
                ],
              ),
            ),
            Step(
              title: const Text('Location'),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.editing,
              content: Column(
                children: [
                  TextFormField(
                    controller: _addressController,
                    decoration: const InputDecoration(labelText: 'Address'),
                    validator: (val) => val == null || val.isEmpty ? 'Enter address' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(labelText: 'City'),
                    validator: (val) => val == null || val.isEmpty ? 'Enter city' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _stateController,
                    decoration: const InputDecoration(labelText: 'State'),
                    validator: (val) => val == null || val.isEmpty ? 'Enter state' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _phoneController,
                    decoration: const InputDecoration(labelText: 'Business Phone'),
                    validator: (val) => val == null || val.isEmpty ? 'Enter phone' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _websiteController,
                    decoration: const InputDecoration(labelText: 'Website (Optional)'),
                  ),
                ],
              ),
            ),
            Step(
              title: const Text('Services'),
              isActive: _currentStep >= 2,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _servicesController,
                          decoration: const InputDecoration(
                            labelText: 'Add Service / Specialty',
                            hintText: 'e.g. WiFi, Car Parking, Spa treatment',
                          ),
                          onSubmitted: (_) => _addService(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _addService,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(54, 48),
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Icon(Icons.add),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _servicesList.map((svc) {
                      return Chip(
                        label: Text(svc),
                        onDeleted: () => _removeService(svc),
                        deleteIcon: const Icon(Icons.cancel_rounded, size: 16),
                        backgroundColor: const Color(0xFFEFF6FF),
                        side: const BorderSide(color: Color(0xFFBFDBFE)),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
