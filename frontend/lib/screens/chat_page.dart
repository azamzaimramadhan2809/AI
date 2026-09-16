import 'package:flutter/material.dart';
import '../widgets/workspace_ui.dart';
import '../widgets/app_avatar.dart';

import '../core/constants/colors.dart';
import '../models/ai_model.dart';
import '../services/nexa_service.dart';

class ChatPage extends StatefulWidget {
  final NexaService service;
  final List<AIModel> assistants;
  final ValueChanged<AIModel> onAIUpdated;
  final VoidCallback onCreateAI;
  final String? initialAIId;

  const ChatPage({
    super.key,
    required this.service,
    required this.assistants,
    required this.onAIUpdated,
    required this.onCreateAI,
    this.initialAIId,
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _message = TextEditingController();
  final _scroll = ScrollController();
  final List<_ChatMessage> _messages = [];
  AIModel? _selected;
  bool _sending = false;
  bool _loading = false;
  bool _updatingMemory = false;
  String? _historyError;
  int _generation = 0;

  @override
  void initState() {
    super.initState();
    if (widget.assistants.isNotEmpty) {
      _selected = widget.assistants.firstWhere(
        (ai) => ai.id == widget.initialAIId,
        orElse: () => widget.assistants.first,
      );
      _loadHistory();
    }
  }

  @override
  void didUpdateWidget(covariant ChatPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_selected == null && widget.assistants.isNotEmpty) {
      _selected = widget.assistants.first;
      _loadHistory();
    } else if (_selected != null) {
      for (final ai in widget.assistants) {
        if (ai.id == _selected!.id) _selected = ai;
      }
    }
  }

  @override
  void dispose() {
    _message.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final ai = _selected;
    final content = _message.text.trim();
    if (ai == null ||
        content.isEmpty ||
        _sending ||
        _loading ||
        _updatingMemory ||
        _historyError != null) {
      return;
    }
    final generation = _generation;
    final history = _messages
        .where((item) => !item.error)
        .map(
          (item) => {
            'role': item.fromUser ? 'user' : 'assistant',
            'content': item.content,
          },
        )
        .toList();
    setState(() {
      _messages.add(_ChatMessage(content, true));
      _message.clear();
      _sending = true;
    });
    _scrollDown();
    final result = await widget.service.sendMessage(
      ai: ai,
      content: content,
      memory: ai.memory,
      sessionHistory: history,
    );
    if (!mounted || generation != _generation) return;
    setState(() {
      _messages.add(
        _ChatMessage(
          result.success ? result.data! : result.message,
          false,
          error: !result.success,
        ),
      );
      _sending = false;
    });
    _scrollDown();
  }

  Future<void> _toggleMemory(bool enabled) async {
    final ai = _selected;
    if (ai == null || _sending || _loading || _updatingMemory) return;
    final previous = ai;
    setState(() => _updatingMemory = true);
    final result = await widget.service.setMemory(ai, enabled);
    if (!mounted) return;
    setState(() => _updatingMemory = false);
    if (result.success && result.data != null) {
      setState(() => _selected = result.data);
      widget.onAIUpdated(result.data!);
    } else {
      setState(() => _selected = previous);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _loadHistory() async {
    final ai = _selected;
    if (ai == null) return;
    final generation = ++_generation;
    setState(() {
      _loading = true;
      _historyError = null;
      _messages.clear();
      _message.clear();
    });
    final result = await widget.service.getHistory(ai.id);
    if (!mounted || generation != _generation) return;
    setState(() {
      _loading = false;
      if (!result.success) {
        _historyError = result.message;
        return;
      }
      _messages.addAll(
        (result.data ?? [])
            .where(
              (m) => [
                'USER',
                'ASSISTANT',
              ].contains(m['role'].toString().toUpperCase()),
            )
            .map(
              (m) => _ChatMessage(
                m['content']?.toString() ?? '',
                m['role'].toString().toUpperCase() == 'USER',
              ),
            ),
      );
    });
    _scrollDown();
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          0,
          duration: Duration(milliseconds: 350),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.assistants.isEmpty) return _empty();
    final ai = _selected ?? widget.assistants.first;
    final c = Theme.of(context).colorScheme;
    return LayoutBuilder(
      builder: (context, box) {
        final compact = box.maxWidth < 650;
        return Padding(
          padding: EdgeInsets.all(compact ? 12 : 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (!compact) ...[
                const PageHeading(
                  eyebrow: 'Workspace / Conversations',
                  title: 'Messages',
                  subtitle: 'Think out loud. Your assistant is listening.',
                ),
                const SizedBox(height: 22),
              ],
              Expanded(
                child: Container(
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    color: c.surface,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: c.outlineVariant),
                  ),
                  child: Column(
                    children: [
                      _chatHeader(ai, compact),
                      Expanded(
                        child: _loading
                            ? const Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    TypingDots(),
                                    SizedBox(height: 18),
                                    Text(
                                      'Opening your conversation',
                                      style: TextStyle(fontSize: 12),
                                    ),
                                  ],
                                ),
                              )
                            : _historyError != null
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(24),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.cloud_off_outlined,
                                        size: 32,
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        _historyError!,
                                        textAlign: TextAlign.center,
                                      ),
                                      TextButton(
                                        onPressed: _loadHistory,
                                        child: const Text('Retry history'),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : _messages.isEmpty
                            ? _welcome(ai)
                            : ListView.builder(
                                controller: _scroll,
                                reverse: true,
                                padding: EdgeInsets.all(compact ? 16 : 28),
                                itemCount:
                                    _messages.length + (_sending ? 1 : 0),
                                itemBuilder: (context, index) => Align(
                                  alignment: Alignment.topCenter,
                                  child: ConstrainedBox(
                                    constraints: const BoxConstraints(
                                      maxWidth: 900,
                                    ),
                                    child: _sending && index == 0
                                        ? _typing()
                                        : _bubble(
                                            _messages[_messages.length -
                                                1 -
                                                index +
                                                (_sending ? 1 : 0)],
                                            _messages.length -
                                                1 -
                                                index +
                                                (_sending ? 1 : 0),
                                          ),
                                  ),
                                ),
                              ),
                      ),
                      _composer(ai, compact),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _chatHeader(AIModel ai, bool compact) {
    final c = Theme.of(context).colorScheme;
    final identity = Row(
      children: [
        AppAvatar(source: ai.avatar, fallback: ai.name, radius: 21),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonHideUnderline(
                child: DropdownButton<AIModel>(
                  value: ai,
                  isDense: true,
                  isExpanded: true,
                  icon: Icon(
                    Icons.expand_more_rounded,
                    size: 19,
                    color: c.onSurfaceVariant,
                  ),
                  items: widget.assistants
                      .map(
                        (a) => DropdownMenuItem(
                          value: a,
                          child: Text(
                            a.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: _sending || _loading || _updatingMemory
                      ? null
                      : (value) {
                          if (value == null || value.id == _selected?.id) {
                            return;
                          }
                          setState(() => _selected = value);
                          _loadHistory();
                        },
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _sending ? 'Thinking through your message…' : ai.category,
                style: TextStyle(color: c.onSurfaceVariant, fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
    final memory = Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: c.secondary.withValues(alpha: .07),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            ai.memory ? Icons.memory_rounded : Icons.visibility_off_outlined,
            size: 17,
            color: c.secondary,
          ),
          const SizedBox(width: 7),
          Text(
            'Memory ${ai.memory ? 'on' : 'off'}',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 11,
              color: c.secondary,
            ),
          ),
          const SizedBox(width: 6),
          SizedBox(
            height: 38,
            child: Switch.adaptive(
              value: ai.memory,
              onChanged: _sending || _loading || _updatingMemory
                  ? null
                  : _toggleMemory,
            ),
          ),
        ],
      ),
    );
    return Container(
      padding: EdgeInsets.all(compact ? 16 : 22),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: c.outlineVariant)),
      ),
      child: compact
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [identity, const SizedBox(height: 12), memory],
            )
          : Row(
              children: [
                Expanded(child: identity),
                const SizedBox(width: 32),
                memory,
              ],
            ),
    );
  }

  Widget _welcome(AIModel ai) => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: WorkspaceTheme.hero,
              borderRadius: BorderRadius.circular(28),
            ),
            child: const OrbitArt(size: 130),
          ),
          const SizedBox(height: 24),
          Text(
            'A conversation. A possibility.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: MediaQuery.sizeOf(context).width < 600 ? 21 : 27,
              letterSpacing: -.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Ask ${ai.name} a question, explore an idea, or just say hello.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 13,
              height: 1.7,
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: [
              for (final prompt in [
                'Help me brainstorm',
                'Plan my day',
                'Teach me something',
              ])
                ActionChip(
                  label: Text(prompt, style: const TextStyle(fontSize: 11)),
                  onPressed: () {
                    _message.text = prompt;
                  },
                ),
            ],
          ),
        ],
      ),
    ),
  );

  Widget _composer(AIModel ai, bool compact) {
    final c = Theme.of(context).colorScheme;
    final disabled = _loading || _updatingMemory || _historyError != null;
    return Container(
      padding: EdgeInsets.fromLTRB(
        compact ? 12 : 24,
        12,
        compact ? 12 : 24,
        12,
      ),
      child: Align(
        alignment: Alignment.bottomCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 940),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.fromLTRB(6, 4, 8, 4),
                decoration: BoxDecoration(
                  color: c.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: c.outlineVariant),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _message,
                        enabled: !disabled,
                        minLines: 1,
                        maxLines: 5,
                        textInputAction: TextInputAction.newline,
                        decoration: InputDecoration(
                          hintText: 'Message ${ai.name}…',
                          filled: false,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 15,
                          ),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                        ),
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          gradient: WorkspaceTheme.gradient,
                          borderRadius: BorderRadius.circular(13),
                        ),
                        child: IconButton(
                          tooltip: 'Send message',
                          onPressed: _sending || disabled ? null : _send,
                          icon: Icon(
                            Icons.arrow_upward_rounded,
                            color: _sending || disabled
                                ? Colors.white38
                                : Colors.white,
                            size: 21,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 9),
              Text(
                ai.memory
                    ? 'Memory on · This conversation is saved to your account.'
                    : 'Memory off · New messages disappear when you leave this page.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: c.onSurfaceVariant,
                  fontSize: 10,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bubble(_ChatMessage message, int index) {
    final c = Theme.of(context).colorScheme;
    return PageEntrance(
      child: Align(
        alignment: message.fromUser
            ? Alignment.centerRight
            : Alignment.centerLeft,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 640),
          margin: EdgeInsets.only(
            bottom: 20,
            left: message.fromUser ? 28 : 0,
            right: message.fromUser ? 0 : 28,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
          decoration: BoxDecoration(
            gradient: message.fromUser ? WorkspaceTheme.gradient : null,
            color: message.fromUser
                ? null
                : message.error
                ? c.errorContainer
                : c.surfaceContainerLow,
            border: message.fromUser
                ? null
                : Border.all(color: c.outlineVariant.withValues(alpha: .6)),
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(18),
              topRight: const Radius.circular(18),
              bottomLeft: Radius.circular(message.fromUser ? 18 : 5),
              bottomRight: Radius.circular(message.fromUser ? 5 : 18),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.fromUser
                    ? 'YOU'
                    : (_selected?.name ?? 'ASSISTANT').toUpperCase(),
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 1.4,
                  fontWeight: FontWeight.w800,
                  color: message.fromUser ? Colors.white70 : c.secondary,
                ),
              ),
              const SizedBox(height: 7),
              SelectableText(
                message.content,
                style: TextStyle(
                  color: message.fromUser
                      ? Colors.white
                      : message.error
                      ? c.onErrorContainer
                      : c.onSurface,
                  fontSize: 14,
                  height: 1.7,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _typing() => Align(
    alignment: Alignment.centerLeft,
    child: Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const TypingDots(),
          const SizedBox(width: 12),
          Text(
            'Thinking',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 11,
            ),
          ),
        ],
      ),
    ),
  );

  Widget _empty() => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 530),
        child: WorkspaceCard(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                decoration: BoxDecoration(
                  gradient: WorkspaceTheme.hero,
                  borderRadius: BorderRadius.circular(28),
                ),
                child: const OrbitArt(size: 160),
              ),
              const SizedBox(height: 24),
              const Text(
                'Every great idea starts with a hello.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -.7,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Create your first assistant and make space for a new conversation.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  height: 1.7,
                ),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: widget.onCreateAI,
                icon: const Icon(Icons.add_rounded),
                label: const Text('Create my AI'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class _ChatMessage {
  final String content;
  final bool fromUser;
  final bool error;
  _ChatMessage(this.content, this.fromUser, {this.error = false});
}
