import 'package:flutter/material.dart';

class AppColors {
  // Primary Tech Blue Tones
  static const Color primaryNavyDark = Color(0xFF090D16);
  static const Color primaryNavy = Color(0xFF0F172A);
  static const Color primaryRoyal = Color(0xFF1E3A8A);
  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color primaryBlueLight = Color(0xFF3B82F6);

  // Modern Complementary Accents (Futuristic & Sophisticated)
  static const Color accentCyan = Color(0xFF0D9488);
  static const Color accentCyanLight = Color(0xFF5EEAD4);
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color accentIndigoLight = Color(0xFF818CF8);

  // Neutral Tones
  static const Color background = Color(0xFFF8FAFC);
  static const Color backgroundAlt = Color(0xFFF1F5F9);
  static const Color surface = Colors.white;
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderActive = Color(0xFF3B82F6);

  // Dark Theme / Glass Surfaces for Hero
  static const Color heroDark = Color(0xFF071A25);
  static const Color heroCardSurface = Color(0xFF102D3B);

  // Status Tones
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10B981);

  // Gradients
  static const LinearGradient brandGradient = LinearGradient(
    colors: [Color(0xFF1D4ED8), Color(0xFF0284C7), Color(0xFF0D9488)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient buttonGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF0D9488)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF071826), Color(0xFF0B3150), Color(0xFF0B5C5A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGlowGradient = LinearGradient(
    colors: [Color(0xFF3B82F6), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Backward-compatibility aliases
  static const Color accentGreen = Color(0xFF10B981);
  static const Color accentGreenDark = Color(0xFF059669);
  static const Color accentGreenLight = Color(0xFF34D399);
  static const Color primaryBlueDark = Color(0xFF0F172A);
  static const LinearGradient blueGreenGradient = brandGradient;
}
