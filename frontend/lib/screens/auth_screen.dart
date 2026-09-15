import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/constants/colors.dart';
import '../services/auth_service.dart';
import '../widgets/animated_background.dart';
import '../widgets/desktop_brand_panel.dart';
import 'home_screen.dart';

enum AuthMode { login, register }

class AuthScreen extends StatefulWidget {
  final AuthMode initialMode;

  const AuthScreen({
    super.key,
    this.initialMode = AuthMode.login,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  late AuthMode _currentMode;
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _usernameController = TextEditingController();
  final _displayNameController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _authService = AuthService();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    _currentMode = widget.initialMode;
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _usernameController.dispose();
    _displayNameController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _switchMode(AuthMode mode) {
    if (_currentMode != mode) {
      setState(() {
        _currentMode = mode;
        _formKey.currentState?.reset();
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();

    setState(() => _isLoading = true);

    if (_currentMode == AuthMode.login) {
      final result = await _authService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (result.success && result.user != null) {
        _showNotification(
          message: result.message.isNotEmpty ? result.message : 'Login berhasil!',
          isSuccess: true,
        );
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => HomeScreen(
              user: result.user!,
              token: result.token,
            ),
          ),
        );
      } else {
        _showNotification(
          message: _formatErrorMessage(result.message),
          isSuccess: false,
        );
      }
    } else {
      // Register
      final regResult = await _authService.register(
        username: _usernameController.text,
        email: _emailController.text,
        password: _passwordController.text,
        displayName: _displayNameController.text.trim().isNotEmpty
            ? _displayNameController.text.trim()
            : null,
      );

      if (!mounted) return;

      if (regResult.success) {
        // Automatically attempt login for seamless UX
        final loginResult = await _authService.login(
          email: _emailController.text,
          password: _passwordController.text,
        );

        if (!mounted) return;
        setState(() => _isLoading = false);

        if (loginResult.success && loginResult.user != null) {
          _showNotification(
            message: 'Pendaftaran berhasil! Selamat datang di Jarvis AI.',
            isSuccess: true,
          );
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => HomeScreen(
                user: loginResult.user!,
                token: loginResult.token,
              ),
            ),
          );
        } else {
          _showNotification(
            message: 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.',
            isSuccess: true,
          );
          _switchMode(AuthMode.login);
        }
      } else {
        setState(() => _isLoading = false);
        _showNotification(
          message: _formatErrorMessage(regResult.message),
          isSuccess: false,
        );
      }
    }
  }

  String _formatErrorMessage(String message) {
    if (message.contains('Internal Server Error')) {
      return 'Gagal memproses data di server backend. Pastikan database backend sudah sinkron (`npx prisma db push`).';
    }
    return message;
  }

  void _showNotification({required String message, required bool isSuccess}) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isSuccess ? Icons.check_circle : Icons.info_outline,
              color: Colors.white,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
              ),
            ),
          ],
        ),
        backgroundColor: isSuccess ? AppColors.success : AppColors.error,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = constraints.maxWidth >= 920;

          if (isDesktop) {
            // Desktop Windows Split Screen
            return Row(
              children: [
                const Expanded(
                  flex: 5,
                  child: DesktopBrandPanel(),
                ),
                Expanded(
                  flex: 6,
                  child: AnimatedBackground(
                    child: Center(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 460),
                          child: _buildAuthCard(),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          }

          // Mobile / Android Compact View
          return AnimatedBackground(
            child: SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
                    child: Column(
                      children: [
                        _buildMobileHeader(),
                        const SizedBox(height: 20),
                        _buildAuthCard(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMobileHeader() {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            gradient: AppColors.buttonGradient,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryBlue.withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(
            Icons.psychology_outlined,
            color: Colors.white,
            size: 34,
          ),
        )
            .animate()
            .scale(duration: 400.ms, curve: Curves.easeOutBack)
            .fadeIn(),
        const SizedBox(height: 12),
        const Text(
          'Jarvis AI Assistant',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryNavy,
          ),
        ).animate().fadeIn(delay: 150.ms),
        const SizedBox(height: 4),
        const Text(
          'Satu asisten cerdas untuk semua kebutuhan Anda',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ).animate().fadeIn(delay: 250.ms),
      ],
    );
  }

  Widget _buildAuthCard() {
    final isLogin = _currentMode == AuthMode.login;

    return Container(
      padding: const EdgeInsets.all(28.0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryNavy.withValues(alpha: 0.06),
            blurRadius: 28,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Sliding Pill Mode Switcher (Login / Register)
            _buildModeSwitcher(),
            const SizedBox(height: 24),

            // Card Header Title
            Text(
              isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isLogin
                  ? 'Masukkan kredensial Anda untuk melanjutkan'
                  : 'Lengkapi data di bawah ini untuk membuat akun',
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),

            // Animated Form Content Switcher
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOutCubic,
              alignment: Alignment.topCenter,
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                switchInCurve: Curves.easeOut,
                switchOutCurve: Curves.easeIn,
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0, 0.04),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey<AuthMode>(_currentMode),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: isLogin ? _buildLoginFields() : _buildRegisterFields(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button with Shimmer Animation
            _buildSubmitButton(),
            const SizedBox(height: 20),

            // Bottom Switcher helper text
            Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  isLogin ? 'Belum memiliki akun? ' : 'Sudah memiliki akun? ',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                GestureDetector(
                  onTap: () => _switchMode(isLogin ? AuthMode.register : AuthMode.login),
                  child: Text(
                    isLogin ? 'Daftar Sekarang' : 'Masuk',
                    style: const TextStyle(
                      color: AppColors.primaryBlue,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                      decorationColor: AppColors.primaryBlue,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.06, end: 0, curve: Curves.easeOutCubic);
  }

  Widget _buildModeSwitcher() {
    final isLogin = _currentMode == AuthMode.login;

    return Container(
      height: 46,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.backgroundAlt,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          // Animated Pill Background
          AnimatedAlign(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOutCubic,
            alignment: isLogin ? Alignment.centerLeft : Alignment.centerRight,
            child: FractionallySizedBox(
              widthFactor: 0.5,
              heightFactor: 1.0,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Action Labels
          Row(
            children: [
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => _switchMode(AuthMode.login),
                  child: Center(
                    child: Text(
                      'Masuk',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isLogin ? FontWeight.bold : FontWeight.w500,
                        color: isLogin ? AppColors.primaryBlue : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => _switchMode(AuthMode.register),
                  child: Center(
                    child: Text(
                      'Daftar Akun',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: !isLogin ? FontWeight.bold : FontWeight.w500,
                        color: !isLogin ? AppColors.primaryBlue : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _buildLoginFields() {
    return [
      _buildLabel('Email'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _emailController,
        keyboardType: TextInputType.emailAddress,
        textInputAction: TextInputAction.next,
        decoration: _buildInputDecoration(
          hintText: 'nama@email.com',
          prefixIcon: Icons.email_outlined,
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Email tidak boleh kosong';
          }
          final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
          if (!emailRegex.hasMatch(value.trim())) {
            return 'Format email tidak valid';
          }
          return null;
        },
      ),
      const SizedBox(height: 16),
      _buildLabel('Kata Sandi'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _passwordController,
        obscureText: _obscurePassword,
        textInputAction: TextInputAction.done,
        onFieldSubmitted: (_) => _handleSubmit(),
        decoration: _buildInputDecoration(
          hintText: 'Masukkan kata sandi',
          prefixIcon: Icons.lock_outline,
          suffixIcon: IconButton(
            icon: Icon(
              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: AppColors.textSecondary,
              size: 20,
            ),
            onPressed: () {
              setState(() => _obscurePassword = !_obscurePassword);
            },
          ),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Kata sandi tidak boleh kosong';
          }
          return null;
        },
      ),
    ];
  }

  List<Widget> _buildRegisterFields() {
    return [
      _buildLabel('Username'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _usernameController,
        textInputAction: TextInputAction.next,
        decoration: _buildInputDecoration(
          hintText: 'Masukkan username',
          prefixIcon: Icons.alternate_email,
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Username tidak boleh kosong';
          }
          if (value.trim().length > 100) {
            return 'Username maksimal 100 karakter';
          }
          return null;
        },
      ),
      const SizedBox(height: 14),
      _buildLabel('Email'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _emailController,
        keyboardType: TextInputType.emailAddress,
        textInputAction: TextInputAction.next,
        decoration: _buildInputDecoration(
          hintText: 'nama@email.com',
          prefixIcon: Icons.email_outlined,
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Email tidak boleh kosong';
          }
          final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
          if (!emailRegex.hasMatch(value.trim())) {
            return 'Format email tidak valid';
          }
          return null;
        },
      ),
      const SizedBox(height: 14),
      _buildLabel('Nama Lengkap (Opsional)'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _displayNameController,
        textInputAction: TextInputAction.next,
        decoration: _buildInputDecoration(
          hintText: 'Nama lengkap Anda',
          prefixIcon: Icons.badge_outlined,
        ),
      ),
      const SizedBox(height: 14),
      _buildLabel('Kata Sandi (Minimal 8 karakter)'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _passwordController,
        obscureText: _obscurePassword,
        textInputAction: TextInputAction.next,
        decoration: _buildInputDecoration(
          hintText: 'Minimal 8 karakter',
          prefixIcon: Icons.lock_outline,
          suffixIcon: IconButton(
            icon: Icon(
              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: AppColors.textSecondary,
              size: 20,
            ),
            onPressed: () {
              setState(() => _obscurePassword = !_obscurePassword);
            },
          ),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Kata sandi tidak boleh kosong';
          }
          if (value.length < 8) {
            return 'Kata sandi minimal 8 karakter';
          }
          if (value.length > 64) {
            return 'Kata sandi maksimal 64 karakter';
          }
          return null;
        },
      ),
      const SizedBox(height: 14),
      _buildLabel('Konfirmasi Kata Sandi'),
      const SizedBox(height: 6),
      TextFormField(
        controller: _confirmPasswordController,
        obscureText: _obscureConfirmPassword,
        textInputAction: TextInputAction.done,
        onFieldSubmitted: (_) => _handleSubmit(),
        decoration: _buildInputDecoration(
          hintText: 'Ulangi kata sandi',
          prefixIcon: Icons.lock_reset_outlined,
          suffixIcon: IconButton(
            icon: Icon(
              _obscureConfirmPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: AppColors.textSecondary,
              size: 20,
            ),
            onPressed: () {
              setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
            },
          ),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Konfirmasi kata sandi tidak boleh kosong';
          }
          if (value != _passwordController.text) {
            return 'Konfirmasi kata sandi tidak cocok';
          }
          return null;
        },
      ),
    ];
  }

  Widget _buildSubmitButton() {
    final isLogin = _currentMode == AuthMode.login;

    return Container(
      height: 48,
      decoration: BoxDecoration(
        gradient: AppColors.buttonGradient,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryBlue.withValues(alpha: 0.35),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleSubmit,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: _isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.2,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isLogin ? 'Masuk ke Jarvis' : 'Buat Akun Saya',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    isLogin ? Icons.arrow_forward_rounded : Icons.person_add_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ],
              ),
      ),
    )
        .animate(target: _isLoading ? 0 : 1)
        .shimmer(delay: 2000.ms, duration: 1200.ms, color: Colors.white.withValues(alpha: 0.2));
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    required String hintText,
    required IconData prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
      prefixIcon: Icon(prefixIcon, color: AppColors.primaryRoyal, size: 19),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: AppColors.background,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderActive, width: 1.8),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error),
      ),
    );
  }
}
