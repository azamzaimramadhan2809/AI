import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';

class AppAvatar extends StatelessWidget {
  final String? source;
  final String fallback;
  final double radius;

  const AppAvatar({
    super.key,
    this.source,
    required this.fallback,
    this.radius = 22,
  });

  @override
  Widget build(BuildContext context) {
    ImageProvider? provider;
    final value = source?.trim() ?? '';
    if (value.startsWith('data:image') && value.contains(',')) {
      try {
        final Uint8List bytes = base64Decode(value.split(',').last);
        provider = MemoryImage(bytes);
      } catch (_) {}
    } else if (value.startsWith('http://') || value.startsWith('https://')) {
      provider = NetworkImage(value);
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: Theme.of(
        context,
      ).colorScheme.secondary.withValues(alpha: .14),
      backgroundImage: provider,
      child: provider == null
          ? Text(
              fallback.isEmpty ? 'U' : fallback[0].toUpperCase(),
              style: TextStyle(
                color: Theme.of(context).colorScheme.secondary,
                fontWeight: FontWeight.w800,
                fontSize: radius * .82,
              ),
            )
          : null,
    );
  }
}
