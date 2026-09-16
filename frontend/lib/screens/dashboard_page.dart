import 'dart:async';
import 'package:flutter/material.dart';
import '../widgets/workspace_ui.dart';
import '../models/ai_model.dart';
import '../models/auth_model.dart';
import '../widgets/app_avatar.dart';

class DashboardPage extends StatefulWidget {
  final UserModel user;
  final List<AIModel> assistants;
  final VoidCallback onCreateAI;
  final ValueChanged<AIModel> onOpenChat;
  const DashboardPage({
    super.key,
    required this.user,
    required this.assistants,
    required this.onCreateAI,
    required this.onOpenChat,
  });
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  DateTime _now = DateTime.now();
  late final Timer _timer;
  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = Theme.of(context).colorScheme;
    final h = _now.hour;
    final greeting = h >= 5 && h < 12
        ? 'Good morning'
        : h >= 12 && h < 17
        ? 'Good afternoon'
        : h >= 17 && h < 21
        ? 'Good evening'
        : 'Good night';
    return LayoutBuilder(
      builder: (context, box) {
        final wide = box.maxWidth >= 700;
        return SingleChildScrollView(
          padding: EdgeInsets.all(wide ? 32 : 18),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1250),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  PageHeading(
                    eyebrow: 'Workspace / Overview',
                    title: 'Dashboard',
                    subtitle: 'Your ideas, your assistants. All in one place.',
                    action: OutlinedButton.icon(
                      onPressed: widget.onCreateAI,
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Create an AI'),
                    ),
                  ),
                  const SizedBox(height: 26),
                  WorkspaceCard(
                    gradient: WorkspaceTheme.hero,
                    padding: EdgeInsets.all(wide ? 32 : 24),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const StatusPill(
                                'YOUR PERSONAL AI SPACE',
                                onDark: true,
                                icon: Icons.bubble_chart_outlined,
                              ),
                              const SizedBox(height: 22),
                              Text(
                                '$greeting,',
                                style: TextStyle(
                                  color: const Color(0xFFC2D8EE),
                                  fontSize: wide ? 26 : 21,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                widget.user.username,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: wide ? 40 : 30,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -1,
                                ),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'Make room for your next big idea.',
                                style: TextStyle(
                                  color: Color(0xFFB4CDDC),
                                  height: 1.6,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 24),
                              FilledButton.icon(
                                style: FilledButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: const Color(0xFF173D59),
                                ),
                                onPressed: widget.assistants.isEmpty
                                    ? widget.onCreateAI
                                    : () => widget.onOpenChat(
                                        widget.assistants.first,
                                      ),
                                icon: const Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 17,
                                ),
                                label: Text(
                                  widget.assistants.isEmpty
                                      ? 'Meet your first assistant'
                                      : 'Start a conversation',
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (wide)
                          const Padding(
                            padding: EdgeInsets.only(left: 24),
                            child: OrbitArt(size: 220),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Your assistants',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 18,
                          ),
                        ),
                      ),
                      Text(
                        '${widget.assistants.length} created',
                        style: TextStyle(
                          color: c.onSurfaceVariant,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  LayoutBuilder(
                    builder: (context, cards) {
                      final width = wide
                          ? (cards.maxWidth - 18) / 2
                          : cards.maxWidth;
                      return Wrap(
                        spacing: 18,
                        runSpacing: 18,
                        children: [
                          for (final ai in widget.assistants)
                            SizedBox(
                              width: width,
                              child: WorkspaceCard(
                                onTap: () => widget.onOpenChat(ai),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(5),
                                          decoration: BoxDecoration(
                                            color: c.secondary.withValues(
                                              alpha: .06,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              18,
                                            ),
                                          ),
                                          child: AppAvatar(
                                            source: ai.avatar,
                                            fallback: ai.name,
                                            radius: 23,
                                          ),
                                        ),
                                        const Spacer(),
                                        StatusPill(
                                          ai.memory
                                              ? 'Memory on'
                                              : 'Memory off',
                                          icon: Icons.memory_outlined,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 22),
                                    Text(
                                      ai.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      ai.description.isEmpty
                                          ? 'Ready for your next idea.'
                                          : ai.description,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: c.onSurfaceVariant,
                                        fontSize: 13,
                                        height: 1.6,
                                      ),
                                    ),
                                    const SizedBox(height: 22),
                                    Divider(color: c.outlineVariant),
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            ai.category,
                                            style: TextStyle(
                                              color: c.onSurfaceVariant,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          'Open chat',
                                          style: TextStyle(
                                            color: c.primary,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 12,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Icon(
                                          Icons.arrow_forward_rounded,
                                          color: c.primary,
                                          size: 17,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (widget.assistants.isEmpty)
                            SizedBox(
                              width: width,
                              child: WorkspaceCard(
                                onTap: widget.onCreateAI,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Icon(
                                      Icons.add_circle_outline_rounded,
                                      size: 32,
                                      color: c.primary,
                                    ),
                                    const SizedBox(height: 22),
                                    const Text(
                                      'An assistant, made for you.',
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      'Give it a name, a personality, and a purpose.',
                                      style: TextStyle(
                                        color: c.onSurfaceVariant,
                                        height: 1.6,
                                      ),
                                    ),
                                    const SizedBox(height: 22),
                                    Text(
                                      'Create your first AI →',
                                      style: TextStyle(
                                        color: c.primary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 30),
                  Text(
                    'Room to grow',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: c.onSurface,
                    ),
                  ),
                  const SizedBox(height: 14),
                  LayoutBuilder(
                    builder: (context, cards) => Wrap(
                      spacing: 18,
                      runSpacing: 18,
                      children: [
                        for (var i = 0; i < 3; i++)
                          SizedBox(
                            width: wide
                                ? (cards.maxWidth - 36) / 3
                                : cards.maxWidth,
                            child: WorkspaceCard(
                              padding: const EdgeInsets.all(22),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    [
                                      Icons.insights_outlined,
                                      Icons.grid_view_rounded,
                                      Icons.bookmark_border_rounded,
                                    ][i],
                                    color: c.onSurfaceVariant,
                                    size: 21,
                                  ),
                                  const SizedBox(height: 28),
                                  Container(
                                    height: 6,
                                    width: 75,
                                    decoration: BoxDecoration(
                                      color: c.outlineVariant,
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    height: 6,
                                    width: 110,
                                    decoration: BoxDecoration(
                                      color: c.outlineVariant.withValues(
                                        alpha: .5,
                                      ),
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                  ),
                                  const SizedBox(height: 18),
                                  Text(
                                    'Coming soon',
                                    style: TextStyle(
                                      color: c.onSurfaceVariant,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
