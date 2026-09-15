import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/constants/colors.dart';

class DesktopBrandPanel extends StatelessWidget {
  const DesktopBrandPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.heroGradient,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 48.0, vertical: 40.0),
      child: Stack(
        children: [
          // Background Tech Grid / Ambient Circles
          Positioned(
            top: -60,
            left: -60,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accentCyan.withValues(alpha: 0.22),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            right: -80,
            child: Container(
              width: 360,
              height: 360,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accentIndigo.withValues(alpha: 0.25),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Content Column
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo & System Status Badge
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          gradient: AppColors.cardGlowGradient,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryBlue.withValues(alpha: 0.4),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.psychology_outlined,
                          color: Colors.white,
                          size: 32,
                        ),
                      )
                          .animate()
                          .scale(duration: 500.ms, curve: Curves.easeOutBack)
                          .fadeIn(duration: 400.ms),
                      const SizedBox(width: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: AppColors.accentCyan.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.accentCyanLight,
                                shape: BoxShape.circle,
                              ),
                            )
                                .animate(onPlay: (controller) => controller.repeat(reverse: true))
                                .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2), duration: 1000.ms),
                            const SizedBox(width: 8),
                            const Text(
                              'Jarvis Core v1.0',
                              style: TextStyle(
                                color: AppColors.accentCyanLight,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 200.ms, duration: 400.ms)
                          .slideX(begin: 0.2, end: 0),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Hero Title
                  RichText(
                    text: const TextSpan(
                      children: [
                        TextSpan(
                          text: 'Asisten AI Cerdas\nuntuk ',
                          style: TextStyle(
                            fontSize: 38,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1.2,
                          ),
                        ),
                        TextSpan(
                          text: 'Produktivitas Anda',
                          style: TextStyle(
                            fontSize: 38,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accentCyanLight,
                            height: 1.2,
                          ),
                        ),
                      ],
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 300.ms, duration: 500.ms)
                      .slideY(begin: 0.15, end: 0),
                  const SizedBox(height: 16),

                  // Subtitle
                  const Text(
                    'Kelola percakapan, otomasi instruksi, dan akses memori persisten yang selalu sinkron antara Windows dan Android.',
                    style: TextStyle(
                      fontSize: 15,
                      color: Color(0xFF94A3B8),
                      height: 1.6,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 400.ms, duration: 500.ms)
                      .slideY(begin: 0.15, end: 0),
                  const SizedBox(height: 36),

                  // Feature Pills
                  _buildFeatureCard(
                    icon: Icons.bolt_rounded,
                    title: 'Respon Cepat & Real-Time',
                    description: 'Didukung LLM mutakhir dengan kemampuan streaming respons instan.',
                    delay: 500.ms,
                  ),
                  const SizedBox(height: 14),
                  _buildFeatureCard(
                    icon: Icons.memory_rounded,
                    title: 'Memori Persisten Terpadu',
                    description: 'Jarvis mengingat konteks penting agar percakapan tetap relevan.',
                    delay: 600.ms,
                  ),
                  const SizedBox(height: 14),
                  _buildFeatureCard(
                    icon: Icons.devices_rounded,
                    title: 'Multi-Device Seamless',
                    description: 'Satu akun untuk Windows desktop, Android mobile, dan Web.',
                    delay: 700.ms,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required Duration delay,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.heroCardSurface.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.08),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primaryBlue.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppColors.accentCyan.withValues(alpha: 0.2),
              ),
            ),
            child: Icon(icon, color: AppColors.accentCyanLight, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: delay, duration: 400.ms)
        .slideX(begin: -0.1, end: 0);
  }
}
