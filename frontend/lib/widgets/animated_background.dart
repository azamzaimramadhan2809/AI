import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../core/constants/colors.dart';

class AnimatedBackground extends StatefulWidget {
  final Widget child;

  const AnimatedBackground({super.key, required this.child});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base Background
        Container(color: AppColors.background),

        // Animated Ambient Glowing Orbs
        AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            final t = _controller.value;
            final orb1Offset = Offset(
              math.sin(t * 2 * math.pi) * 35,
              math.cos(t * 2 * math.pi) * 25,
            );
            final orb2Offset = Offset(
              math.cos(t * 2 * math.pi) * 45,
              math.sin(t * 2 * math.pi) * 30,
            );

            return Stack(
              children: [
                // Top-Right Cyan/Blue Glow
                Positioned(
                  top: -80 + orb1Offset.dy,
                  right: -80 + orb1Offset.dx,
                  child: Container(
                    width: 320,
                    height: 320,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.accentCyanLight.withValues(alpha: 0.18),
                          AppColors.primaryBlueLight.withValues(alpha: 0.08),
                          Colors.transparent,
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),
                ),

                // Bottom-Left Indigo/Blue Glow
                Positioned(
                  bottom: -100 + orb2Offset.dy,
                  left: -100 + orb2Offset.dx,
                  child: Container(
                    width: 360,
                    height: 360,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppColors.accentIndigo.withValues(alpha: 0.14),
                          AppColors.primaryRoyal.withValues(alpha: 0.06),
                          Colors.transparent,
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),

        // Foreground Content
        widget.child,
      ],
    );
  }
}
