import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../core/constants/colors.dart';
import '../models/auth_model.dart';
import '../services/nexa_service.dart';
import 'app_avatar.dart';
import 'workspace_ui.dart';

class ProfilePanel extends StatefulWidget {
  final UserModel user;
  final NexaService service;
  final ValueChanged<UserModel> onSaved;
  final VoidCallback onLogout;
  final bool embedded;

  const ProfilePanel({
    super.key,
    required this.user,
    required this.service,
    required this.onSaved,
    required this.onLogout,
    this.embedded = false,
  });

  @override
  State<ProfilePanel> createState() => _ProfilePanelState();
}

class _ProfilePanelState extends State<ProfilePanel> {
  late final TextEditingController _username;
  late final TextEditingController _displayName;
  String? _avatar;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _username = TextEditingController(text: widget.user.username);
    _displayName = TextEditingController(text: widget.user.displayName ?? '');
    _avatar = widget.user.avatar;
  }

  @override
  void dispose() {
    _username.dispose();
    _displayName.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );
    if (!mounted || result == null) return;
    final file = result.files.single;
    if (file.size > 2 * 1024 * 1024) {
      _notify('Ukuran foto maksimal 2 MB.', false);
      return;
    }
    final bytes = file.bytes;
    if (bytes == null) {
      _notify('Foto tidak dapat dibaca.', false);
      return;
    }
    final extension = (file.extension ?? 'png').toLowerCase();
    final mime = extension == 'jpg' || extension == 'jpeg' ? 'jpeg' : extension;
    setState(() => _avatar = 'data:image/$mime;base64,${base64Encode(bytes)}');
  }

  Future<void> _save() async {
    if (_username.text.trim().isEmpty) {
      _notify('Username tidak boleh kosong.', false);
      return;
    }
    setState(() => _saving = true);
    final result = await widget.service.updateProfile(
      username: _username.text,
      displayName: _displayName.text,
      avatar: _avatar,
    );
    if (!mounted) return;
    setState(() => _saving = false);
    _notify(result.message, result.success);
    if (result.success && result.data != null) {
      widget.onSaved(result.data!);
      if (!widget.embedded) Navigator.of(context).pop();
    }
  }

  void _notify(String message, bool success) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? AppColors.success : AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, box) {
      final c = Theme.of(context).colorScheme;
      final wide = box.maxWidth >= 800;
      final identity = WorkspaceCard(
        padding: EdgeInsets.zero,
        child: Column(
          children: [
            Container(
              height: 110,
              decoration: const BoxDecoration(
                gradient: WorkspaceTheme.hero,
                borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
              ),
              child: const Center(child: OrbitArt(size: 110)),
            ),
            Padding(
              padding: const EdgeInsets.all(26),
              child: Column(
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      AppAvatar(
                        source: _avatar,
                        fallback: _username.text,
                        radius: 44,
                      ),
                      Positioned(
                        right: -5,
                        bottom: -3,
                        child: Material(
                          color: c.primary,
                          shape: const CircleBorder(),
                          child: IconButton(
                            onPressed: _saving ? null : _pickAvatar,
                            tooltip: 'Upload profile picture',
                            icon: Icon(
                              Icons.photo_camera_outlined,
                              color: c.onPrimary,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(
                    widget.user.displayName?.isNotEmpty == true
                        ? widget.user.displayName!
                        : widget.user.username,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 21,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    '@${widget.user.username}',
                    style: TextStyle(color: c.secondary, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.user.email,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: c.onSurfaceVariant, fontSize: 12),
                  ),
                  const SizedBox(height: 22),
                  const StatusPill(
                    'Your personal workspace',
                    icon: Icons.person_outline_rounded,
                  ),
                  const SizedBox(height: 20),
                  Divider(color: c.outlineVariant),
                  const SizedBox(height: 10),
                  TextButton.icon(
                    onPressed: _saving ? null : _pickAvatar,
                    icon: const Icon(Icons.upload_rounded, size: 18),
                    label: const Text('Change photo'),
                  ),
                  Text(
                    'Image files · up to 2 MB',
                    style: TextStyle(color: c.onSurfaceVariant, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
      final form = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          WorkspaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Personal details',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(
                  'The details that make this space yours.',
                  style: TextStyle(
                    color: c.onSurfaceVariant,
                    fontSize: 12,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 26),
                TextField(
                  controller: _username,
                  enabled: !_saving,
                  decoration: const InputDecoration(
                    labelText: 'Username',
                    prefixIcon: Icon(Icons.alternate_email_rounded, size: 19),
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _displayName,
                  enabled: !_saving,
                  decoration: const InputDecoration(
                    labelText: 'Full name',
                    prefixIcon: Icon(Icons.badge_outlined, size: 19),
                  ),
                ),
                const SizedBox(height: 20),
                InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Email address',
                    prefixIcon: Icon(Icons.mail_outline_rounded, size: 19),
                  ),
                  child: Text(
                    widget.user.email,
                    style: TextStyle(color: c.onSurfaceVariant, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your email is linked to your sign-in account.',
                  style: TextStyle(color: c.onSurfaceVariant, fontSize: 11),
                ),
                const SizedBox(height: 26),
                Align(
                  alignment: Alignment.centerRight,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _save,
                    icon: _saving
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check_rounded, size: 19),
                    label: const Text('Save changes'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          WorkspaceCard(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Signing off?',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'Your saved conversations will be here.',
                        style: TextStyle(
                          color: c.onSurfaceVariant,
                          fontSize: 11,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                TextButton(
                  onPressed: widget.onLogout,
                  style: TextButton.styleFrom(foregroundColor: c.error),
                  child: const Text('Sign out'),
                ),
              ],
            ),
          ),
        ],
      );
      return SingleChildScrollView(
        padding: EdgeInsets.all(wide ? 32 : 18),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                PageHeading(
                  eyebrow: 'Workspace / Account',
                  title: 'Your profile',
                  subtitle: 'A familiar face. A space that feels like you.',
                  action: widget.embedded
                      ? null
                      : IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.close),
                        ),
                ),
                const SizedBox(height: 26),
                if (wide)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 2, child: identity),
                      const SizedBox(width: 24),
                      Expanded(flex: 3, child: form),
                    ],
                  )
                else ...[
                  identity,
                  const SizedBox(height: 24),
                  form,
                ],
              ],
            ),
          ),
        ),
      );
    },
  );
}
