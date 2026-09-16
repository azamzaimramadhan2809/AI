import 'dart:async';
import 'package:flutter/material.dart';
import '../models/ai_model.dart';
import '../models/auth_model.dart';
import '../services/nexa_service.dart';
import '../widgets/app_avatar.dart';
import '../widgets/workspace_ui.dart';
import '../widgets/profile_panel.dart';
import 'ai_studio_page.dart';
import 'auth_screen.dart';
import 'chat_page.dart';
import 'dashboard_page.dart';

class HomeScreen extends StatefulWidget {
  final UserModel user;
  final String? token;
  final NexaService? service;
  const HomeScreen({super.key, required this.user, this.token, this.service});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late UserModel _user;
  late final NexaService _service;
  final List<AIModel> _assistants = [];
  int _index = 0;
  bool _expanded = true, _dark = false, _loading = true;
  String? _error, _chatAI;
  static const _labels = ['Dashboard', 'AI Studio', 'Messages', 'Insights'];
  static const _icons = [
    Icons.grid_view_rounded,
    Icons.auto_awesome_rounded,
    Icons.forum_outlined,
    Icons.insights_rounded,
  ];
  @override
  void initState() {
    super.initState();
    _user = widget.user;
    _service = widget.service ?? NexaService(token: widget.token ?? '');
    _load();
  }

  Future<void> _load() async {
    if ((widget.token ?? '').isEmpty && widget.service == null) {
      setState(() => _loading = false);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    final result = await _service.getAIs();
    if (!mounted) return;
    setState(() {
      _loading = false;
      _error = result.success ? null : result.message;
      if (result.success) {
        _assistants
          ..clear()
          ..addAll(result.data ?? []);
      }
    });
  }

  void _upsert(AIModel ai) => setState(() {
    final i = _assistants.indexWhere((a) => a.id == ai.id);
    if (i < 0) {
      _assistants.add(ai);
    } else {
      _assistants[i] = ai;
    }
  });
  void _chat([AIModel? ai]) => setState(() {
    _chatAI = ai?.id;
    _index = 2;
  });
  void _logout() => Navigator.of(context).pushAndRemoveUntil(
    MaterialPageRoute<void>(builder: (_) => const AuthScreen()),
    (_) => false,
  );
  @override
  Widget build(BuildContext context) => AnimatedTheme(
    data: WorkspaceTheme.create(_dark),
    duration: const Duration(milliseconds: 260),
    child: Builder(
      builder: (context) => LayoutBuilder(
        builder: (context, box) {
          final desktop = box.maxWidth >= 840;
          final c = Theme.of(context).colorScheme;
          return Scaffold(
            drawer: desktop
                ? null
                : Drawer(
                    backgroundColor: c.surface,
                    child: SafeArea(
                      child: _sidebar(context, true, mobile: true),
                    ),
                  ),
            body: SafeArea(
              child: Column(
                children: [
                  Container(
                    height: 78,
                    padding: EdgeInsets.symmetric(
                      horizontal: desktop ? 28 : 12,
                    ),
                    decoration: BoxDecoration(
                      color: c.surface,
                      border: Border(
                        bottom: BorderSide(color: c.outlineVariant),
                      ),
                    ),
                    child: Row(
                      children: [
                        if (!desktop)
                          Builder(
                            builder: (context) => IconButton(
                              tooltip: 'Open menu',
                              onPressed: () =>
                                  Scaffold.of(context).openDrawer(),
                              icon: const Icon(Icons.menu_rounded),
                            ),
                          ),
                        if (desktop) ...[
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              gradient: WorkspaceTheme.gradient,
                              borderRadius: BorderRadius.circular(11),
                            ),
                            child: const Icon(
                              Icons.hub_rounded,
                              color: Colors.white,
                              size: 21,
                            ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'NexaSmart- AI',
                                maxLines: 1,
                                style: TextStyle(
                                  fontSize: desktop ? 18 : 14,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -.5,
                                ),
                              ),
                              if (desktop)
                                Text(
                                  'A space for your intelligence',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: c.onSurfaceVariant,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (desktop) ...[
                          Container(
                            width: 1,
                            height: 30,
                            color: c.outlineVariant,
                          ),
                          const SizedBox(width: 24),
                        ],
                        _LiveClock(compact: !desktop),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Row(
                      children: [
                        if (desktop)
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 260),
                            curve: Curves.easeInOutCubic,
                            width: _expanded ? 246 : 84,
                            child: _sidebar(context, _expanded),
                          ),
                        Expanded(
                          child: Column(
                            children: [
                              if (_loading)
                                const LinearProgressIndicator(minHeight: 2),
                              if (_error != null)
                                MaterialBanner(
                                  content: Text(_error!),
                                  actions: [
                                    TextButton(
                                      onPressed: _load,
                                      child: const Text('Retry'),
                                    ),
                                  ],
                                ),
                              Expanded(
                                child: PageEntrance(
                                  key: ValueKey(_index),
                                  child: _page(),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    ),
  );

  Widget _sidebar(BuildContext context, bool expanded, {bool mobile = false}) {
    final c = Theme.of(context).colorScheme;
    void select(int i) {
      if (mobile) Navigator.pop(context);
      setState(() => _index = i);
    }

    Widget item(
      String label,
      IconData icon,
      VoidCallback onTap, {
      bool selected = false,
      Widget? leading,
      String? subtitle,
    }) => Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Tooltip(
        message: label,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            gradient: selected ? WorkspaceTheme.gradient : null,
          ),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                height: 52,
                child: LayoutBuilder(
                  builder: (context, box) {
                    // Border and fractional device scaling must not consume the icon's last pixel.
                    final labelsFit = expanded && box.maxWidth >= 150;
                    final iconWidget =
                        leading ??
                        Icon(
                          icon,
                          size: 21,
                          color: selected ? Colors.white : c.onSurfaceVariant,
                        );
                    if (!labelsFit) return Center(child: iconWidget);
                    return Row(
                      children: [
                        SizedBox(width: 48, child: Center(child: iconWidget)),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                label,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: selected ? Colors.white : c.onSurface,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              if (subtitle != null)
                                Text(
                                  subtitle,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: selected
                                        ? Colors.white70
                                        : c.onSurfaceVariant,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        border: Border(right: BorderSide(color: c.outlineVariant)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 16),
          item(
            mobile
                ? 'Close menu'
                : (expanded ? 'Collapse sidebar' : 'Expand sidebar'),
            expanded
                ? Icons.keyboard_double_arrow_left_rounded
                : Icons.keyboard_double_arrow_right_rounded,
            () {
              if (mobile) {
                Navigator.pop(context);
              } else {
                setState(() => _expanded = !_expanded);
              }
            },
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                for (var i = 0; i < _labels.length; i++)
                  item(
                    _labels[i],
                    _icons[i],
                    () => select(i),
                    selected: i == _index,
                  ),
              ],
            ),
          ),
          const Divider(indent: 20, endIndent: 20, height: 24),
          item(
            _dark ? 'Light mode' : 'Dark mode',
            _dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            () => setState(() => _dark = !_dark),
          ),
          item(
            'Profile',
            Icons.person_outline,
            () => select(4),
            selected: _index == 4,
            subtitle: '@${_user.username}',
            leading: AppAvatar(
              source: _user.avatar,
              fallback: _user.username,
              radius: 16,
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _page() {
    switch (_index) {
      case 1:
        return AIStudioPage(
          service: _service,
          assistants: _assistants,
          onCreated: _upsert,
          onOpenChat: _chat,
        );
      case 2:
        return ChatPage(
          service: _service,
          assistants: _assistants,
          initialAIId: _chatAI,
          onAIUpdated: _upsert,
          onCreateAI: () => setState(() => _index = 1),
        );
      case 3:
        return Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: WorkspaceCard(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const OrbitArt(size: 150),
                    const SizedBox(height: 20),
                    const Text(
                      'A fresh perspective, soon.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Your space for news and insights is taking shape.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const StatusPill(
                      'Coming soon',
                      icon: Icons.insights_rounded,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      case 4:
        return ProfilePanel(
          user: _user,
          service: _service,
          embedded: true,
          onSaved: (user) => setState(() => _user = user),
          onLogout: _logout,
        );
      default:
        return DashboardPage(
          user: _user,
          assistants: _assistants,
          onCreateAI: () => setState(() => _index = 1),
          onOpenChat: _chat,
        );
    }
  }
}

class _LiveClock extends StatefulWidget {
  final bool compact;
  const _LiveClock({required this.compact});
  @override
  State<_LiveClock> createState() => _LiveClockState();
}

class _LiveClockState extends State<_LiveClock> {
  DateTime _now = DateTime.now();
  late final Timer _timer;
  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
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
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    String pad(int n) => n.toString().padLeft(2, '0');
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          '${pad(_now.hour)}:${pad(_now.minute)}:${pad(_now.second)}',
          style: TextStyle(
            fontSize: widget.compact ? 17 : 22,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
          ),
        ),
        Text(
          '${days[_now.weekday - 1]}, ${_now.day} ${months[_now.month - 1]} ${_now.year}',
          style: TextStyle(
            fontSize: widget.compact ? 9 : 11,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
