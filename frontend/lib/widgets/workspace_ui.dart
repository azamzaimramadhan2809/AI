import 'dart:math' as math;
import 'package:flutter/material.dart';

class WorkspaceTheme {
  static const gradient = LinearGradient(
    colors: [Color(0xFF3565EA), Color(0xFF119C95)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const hero = LinearGradient(
    colors: [Color(0xFF102A50), Color(0xFF103E57), Color(0xFF11605F)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static ThemeData create(bool dark) {
    final colors =
        ColorScheme.fromSeed(
          seedColor: const Color(0xFF3267DC),
          brightness: dark ? Brightness.dark : Brightness.light,
        ).copyWith(
          primary: dark ? const Color(0xFF8CAFFF) : const Color(0xFF315FCD),
          secondary: dark ? const Color(0xFF6DDCC3) : const Color(0xFF148474),
          surface: dark ? const Color(0xFF142132) : Colors.white,
          surfaceContainerLow: dark
              ? const Color(0xFF101C2C)
              : const Color(0xFFF5F7FC),
          surfaceContainerHigh: dark
              ? const Color(0xFF1D2D42)
              : const Color(0xFFEDF2FA),
          onSurface: dark ? const Color(0xFFE8EFFB) : const Color(0xFF182B48),
          onSurfaceVariant: dark
              ? const Color(0xFF9AAEC7)
              : const Color(0xFF6B7D95),
          outlineVariant: dark
              ? const Color(0xFF293B50)
              : const Color(0xFFE3EAF4),
        );
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Segoe UI',
      colorScheme: colors,
      scaffoldBackgroundColor: dark
          ? const Color(0xFF0C1624)
          : const Color(0xFFF3F6FC),
      dividerColor: colors.outlineVariant,
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: colors.inverseSurface,
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: TextStyle(color: colors.onInverseSurface),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.surfaceContainerLow,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 18,
        ),
        labelStyle: TextStyle(color: colors.onSurfaceVariant, fontSize: 13),
        hintStyle: TextStyle(color: colors.onSurfaceVariant, fontSize: 13),
        prefixIconColor: colors.onSurfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: colors.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: colors.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: colors.primary, width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(13),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          side: BorderSide(color: colors.outlineVariant),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(13),
          ),
        ),
      ),
    );
  }
}

/// An entrance animation that disposes with its page; outgoing chats never stay alive.
class PageEntrance extends StatelessWidget {
  final Widget child;
  const PageEntrance({super.key, required this.child});
  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
    tween: Tween(begin: 0, end: 1),
    duration: Duration(
      milliseconds: MediaQuery.disableAnimationsOf(context) ? 0 : 380,
    ),
    curve: Curves.easeOutCubic,
    builder: (_, value, child) => Opacity(
      opacity: value,
      child: Transform.translate(
        offset: Offset(0, 12 * (1 - value)),
        child: child,
      ),
    ),
    child: child,
  );
}

class WorkspaceCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final Gradient? gradient;
  const WorkspaceCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(24),
    this.gradient,
  });
  @override
  State<WorkspaceCard> createState() => _WorkspaceCardState();
}

class _WorkspaceCardState extends State<WorkspaceCard> {
  bool _hover = false;
  @override
  Widget build(BuildContext context) {
    final c = Theme.of(context).colorScheme;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        transform: Matrix4.translationValues(
          0,
          _hover && widget.onTap != null ? -3 : 0,
          0,
        ),
        decoration: BoxDecoration(
          color: c.surface,
          gradient: widget.gradient,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: _hover && widget.onTap != null
                ? c.primary.withValues(alpha: .5)
                : c.outlineVariant,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(
                alpha: Theme.of(context).brightness == Brightness.dark
                    ? .12
                    : .025,
              ),
              blurRadius: _hover ? 24 : 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(22),
          child: InkWell(
            onTap: widget.onTap,
            borderRadius: BorderRadius.circular(22),
            child: Padding(padding: widget.padding, child: widget.child),
          ),
        ),
      ),
    );
  }
}

class PageHeading extends StatelessWidget {
  final String eyebrow, title, subtitle;
  final Widget? action;
  const PageHeading({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    this.action,
  });
  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, box) {
      final text = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            eyebrow.toUpperCase(),
            style: TextStyle(
              color: Theme.of(context).colorScheme.secondary,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 9),
          Text(
            title,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              letterSpacing: -.8,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            subtitle,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 13,
              height: 1.6,
            ),
          ),
        ],
      );
      if (action == null || box.maxWidth < 650) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            text,
            if (action != null) ...[const SizedBox(height: 18), action!],
          ],
        );
      }
      return Row(
        children: [
          Expanded(child: text),
          const SizedBox(width: 24),
          action!,
        ],
      );
    },
  );
}

class StatusPill extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool onDark;
  const StatusPill(
    this.label, {
    super.key,
    this.icon = Icons.auto_awesome_outlined,
    this.onDark = false,
  });
  @override
  Widget build(BuildContext context) {
    final color = onDark
        ? const Color(0xFFA9EEDD)
        : Theme.of(context).colorScheme.secondary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: color.withValues(alpha: .18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Decorative orbital illustration, never presented as live data.
class OrbitArt extends StatelessWidget {
  final double size;
  const OrbitArt({super.key, this.size = 210});
  @override
  Widget build(BuildContext context) => SizedBox(
    width: size,
    height: size,
    child: CustomPaint(
      painter: _OrbitPainter(),
      child: Center(
        child: Container(
          width: size * .32,
          height: size * .32,
          decoration: BoxDecoration(
            gradient: WorkspaceTheme.gradient,
            borderRadius: BorderRadius.circular(size * .1),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF3DCCA9).withValues(alpha: .2),
                blurRadius: 50,
                spreadRadius: 8,
              ),
            ],
          ),
          child: Icon(
            Icons.auto_awesome_rounded,
            color: Colors.white,
            size: size * .15,
          ),
        ),
      ),
    ),
  );
}

class _OrbitPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    for (var i = 1; i <= 3; i++) {
      final radius = size.width * (.17 + i * .1);
      canvas.drawCircle(
        center,
        radius,
        Paint()
          ..color = const Color(0xFF82DAD1).withValues(alpha: .2 - i * .035)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1,
      );
      final angle = i * 2.1;
      canvas.drawCircle(
        center + Offset(math.cos(angle), math.sin(angle)) * radius,
        i == 2 ? 5 : 3,
        Paint()..color = const Color(0xFFA0E3DC).withValues(alpha: .65),
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class TypingDots extends StatefulWidget {
  const TypingDots({super.key});
  @override
  State<TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<TypingDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  );
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.stop();
    } else {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Semantics(
    label: 'AI is thinking',
    child: AnimatedBuilder(
      animation: _controller,
      builder: (context, _) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < 3; i++)
            Transform.translate(
              offset: Offset(
                0,
                -5 *
                    math.max(
                      0,
                      math.sin((_controller.value * 2 * math.pi) - i * .75),
                    ),
              ),
              child: Container(
                width: 7,
                height: 7,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Theme.of(context).colorScheme.secondary.withValues(
                    alpha:
                        .5 +
                        .5 *
                            math.max(
                              0,
                              math.sin(
                                _controller.value * 2 * math.pi - i * .75,
                              ),
                            ),
                  ),
                ),
              ),
            ),
        ],
      ),
    ),
  );
}
