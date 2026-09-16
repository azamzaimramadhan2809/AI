import 'package:flutter/material.dart';
import '../widgets/workspace_ui.dart';

import '../core/constants/colors.dart';
import '../models/ai_model.dart';
import '../services/nexa_service.dart';

class AIStudioPage extends StatefulWidget {
  final NexaService service;
  final List<AIModel> assistants;
  final ValueChanged<AIModel> onCreated;
  final VoidCallback onOpenChat;

  const AIStudioPage({
    super.key,
    required this.service,
    required this.assistants,
    required this.onCreated,
    required this.onOpenChat,
  });

  @override
  State<AIStudioPage> createState() => _AIStudioPageState();
}

class _AIStudioPageState extends State<AIStudioPage> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController(text: 'Loki');
  final _description = TextEditingController(text: 'AI Assistant');
  final _category = TextEditingController(text: 'Assistant');
  final _prompt = TextEditingController(text: 'You are my AI Assistant.');
  final _personality = TextEditingController(
    text: 'Friendly + Humble + Professional',
  );
  final _avatar = TextEditingController();
  String _assistantType = 'desktop';
  bool _memory = true;
  bool _saving = false;

  @override
  void dispose() {
    for (final controller in [
      _name,
      _description,
      _category,
      _prompt,
      _personality,
      _avatar,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _create() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final result = await widget.service.createAI({
      'name': _name.text.trim(),
      'description': _description.text.trim(),
      'category': _category.text.trim(),
      'prompt': _prompt.text.trim(),
      'personality': _personality.text.trim(),
      'memory': _memory,
      'avatar': _avatar.text.trim(),
      'assistantType': _assistantType,
    });
    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result.success
              ? 'AI ${result.data!.name} berhasil dibuat.'
              : result.message,
        ),
        backgroundColor: result.success ? AppColors.success : AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
    if (result.success && result.data != null) widget.onCreated(result.data!);
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, box) {
      final wide = box.maxWidth >= 850;
      return SingleChildScrollView(
        padding: EdgeInsets.all(box.maxWidth > 700 ? 32 : 18),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1250),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                PageHeading(
                  eyebrow: 'Workspace / Create',
                  title: 'AI Studio',
                  subtitle:
                      'A personality. A purpose. An assistant that feels like yours.',
                  action: StatusPill(
                    '${widget.assistants.length} / 2 assistants',
                    icon: Icons.auto_awesome_outlined,
                  ),
                ),
                const SizedBox(height: 26),
                if (widget.assistants.isNotEmpty) ...[
                  WorkspaceCard(
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      children: [
                        Icon(
                          Icons.auto_awesome_rounded,
                          color: Theme.of(context).colorScheme.secondary,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            widget.assistants.map((ai) => ai.name).join(' · '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                        TextButton.icon(
                          onPressed: widget.onOpenChat,
                          icon: const Icon(
                            Icons.arrow_forward_rounded,
                            size: 16,
                          ),
                          label: const Text('Open chat'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
                Form(
                  key: _formKey,
                  child: wide
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(flex: 3, child: _form()),
                            const SizedBox(width: 24),
                            Expanded(flex: 2, child: _preview()),
                          ],
                        )
                      : Column(
                          children: [
                            _form(),
                            const SizedBox(height: 24),
                            _preview(),
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

  Widget _section(String number, String title, String subtitle) => Padding(
    padding: const EdgeInsets.only(bottom: 22),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 30,
          height: 30,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: .09),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            number,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 12,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );

  Widget _form() => WorkspaceCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _section('01', 'Meet your assistant', 'Start with the essentials.'),
        _field(_name, 'Name', Icons.auto_awesome_outlined, required: true),
        _field(_description, 'Description', Icons.notes_rounded),
        _field(_category, 'Category', Icons.category_outlined),
        const SizedBox(height: 8),
        Divider(color: Theme.of(context).colorScheme.outlineVariant),
        const SizedBox(height: 22),
        _section(
          '02',
          'Give it a personality',
          'Define how your assistant thinks and speaks.',
        ),
        _field(
          _personality,
          'Personality',
          Icons.sentiment_satisfied_alt_rounded,
        ),
        _field(
          _prompt,
          'System prompt',
          Icons.terminal_rounded,
          lines: 4,
          required: true,
        ),
        const SizedBox(height: 8),
        Divider(color: Theme.of(context).colorScheme.outlineVariant),
        const SizedBox(height: 22),
        _section('03', 'Make it yours', 'Fine-tune the experience.'),
        DropdownButtonFormField<String>(
          initialValue: _assistantType,
          isExpanded: true,
          decoration: const InputDecoration(
            labelText: 'Platform',
            prefixIcon: Icon(Icons.devices_outlined, size: 20),
          ),
          items: const [
            DropdownMenuItem(value: 'desktop', child: Text('Desktop')),
            DropdownMenuItem(value: 'mobile', child: Text('Mobile')),
            DropdownMenuItem(value: 'all', child: Text('All devices')),
          ],
          onChanged: _saving
              ? null
              : (value) => setState(() => _assistantType = value ?? 'desktop'),
        ),
        const SizedBox(height: 16),
        _field(_avatar, 'Avatar label / URL', Icons.face_outlined),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(
              context,
            ).colorScheme.secondary.withValues(alpha: .07),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Persistent memory',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'Remember conversations across sessions.',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                        fontSize: 11,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              Switch.adaptive(
                value: _memory,
                onChanged: _saving ? null : (v) => setState(() => _memory = v),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        FilledButton.icon(
          onPressed: _saving || widget.assistants.length >= 2 ? null : _create,
          icon: _saving
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.add_rounded, size: 20),
          label: Text(
            widget.assistants.length >= 2
                ? 'Maximum 2 AI reached'
                : 'Create assistant',
          ),
        ),
      ],
    ),
  );

  Widget _preview() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      WorkspaceCard(
        gradient: WorkspaceTheme.hero,
        child: Column(
          children: [
            const Row(
              children: [
                StatusPill(
                  'LIVE PREVIEW',
                  onDark: true,
                  icon: Icons.visibility_outlined,
                ),
              ],
            ),
            const OrbitArt(size: 190),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 180),
              child: Text(
                _name.text.isEmpty ? 'Your AI' : _name.text,
                key: ValueKey(_name.text),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _description.text.isEmpty
                  ? 'Your personal assistant'
                  : _description.text,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFFB7D0E1),
                height: 1.6,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 22),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              runSpacing: 8,
              children: [
                StatusPill(
                  _category.text.isEmpty ? 'Assistant' : _category.text,
                  onDark: true,
                ),
                StatusPill(
                  _memory ? 'Memory on' : 'Memory off',
                  onDark: true,
                  icon: Icons.memory_outlined,
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
      const SizedBox(height: 18),
      WorkspaceCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.tips_and_updates_outlined,
              color: Theme.of(context).colorScheme.secondary,
              size: 22,
            ),
            const SizedBox(height: 14),
            const Text(
              'A little direction goes a long way.',
              style: TextStyle(fontWeight: FontWeight.w700, height: 1.5),
            ),
            const SizedBox(height: 10),
            Text(
              'Try describing a role, a tone of voice, and the kind of help you need in the system prompt.',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                height: 1.7,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    ],
  );

  Widget _field(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool required = false,
    int lines = 1,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: TextFormField(
      controller: controller,
      enabled: !_saving,
      maxLines: lines,
      onChanged: (_) => setState(() {}),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        alignLabelWithHint: lines > 1,
      ),
      validator: required
          ? (value) => value == null || value.trim().isEmpty
                ? '$label is required'
                : null
          : null,
    ),
  );
}
