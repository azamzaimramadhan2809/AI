// Opt-in visual review: flutter test test/design_preview_test.dart --dart-define=NEXA_PREVIEWS=true
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:jarvis/models/auth_model.dart';
import 'package:jarvis/screens/home_screen.dart';
import 'package:jarvis/services/nexa_service.dart';

void main() {
  testWidgets(
    'Render workspace previews with sample data',
    (tester) async {
      tester.view.physicalSize = const Size(1440, 1080);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.runAsync(() async {
        final icons = FontLoader('MaterialIcons')
          ..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'));
        await icons.load();
        final font = File('C:/Windows/Fonts/segoeui.ttf');
        if (await font.exists()) {
          final loader = FontLoader('Segoe UI')
            ..addFont(font.readAsBytes().then((b) => ByteData.sublistView(b)));
          await loader.load();
        }
      });
      final service = NexaService(
        token: 'preview',
        client: MockClient((request) async {
          if (request.url.path.endsWith('/history')) {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': [
                  {
                    'role': 'USER',
                    'content': 'Help me turn an idea into a plan.',
                  },
                  {
                    'role': 'ASSISTANT',
                    'content':
                        'Of course. Let’s start with what matters most to you.\n\nTell me about your idea, who it is for, and what a successful first step would look like. We can build from there.',
                  },
                ],
              }),
              200,
              headers: {'content-type': 'application/json; charset=utf-8'},
            );
          }
          return http.Response(
            jsonEncode({
              'success': true,
              'data': [
                {
                  'id': 'loki',
                  'name': 'Loki',
                  'description': 'Your thoughtful everyday companion',
                  'category': 'Personal assistant',
                  'memory': true,
                },
                {
                  'id': 'nova',
                  'name': 'Nova',
                  'description': 'A creative partner for your next big idea',
                  'category': 'Creative partner',
                  'memory': false,
                },
              ],
            }),
            200,
            headers: {'content-type': 'application/json; charset=utf-8'},
          );
        }),
      );
      final boundaryKey = GlobalKey();
      await tester.pumpWidget(
        RepaintBoundary(
          key: boundaryKey,
          child: MaterialApp(
            debugShowCheckedModeBanner: false,
            home: HomeScreen(
              user: UserModel(
                id: 'preview',
                username: 'Zaim',
                displayName: 'Zaim',
                email: 'zaim@example.com',
              ),
              service: service,
            ),
          ),
        ),
      );
      Future<void> settle() async {
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 600));
        await tester.pump(const Duration(milliseconds: 600));
        expect(tester.takeException(), isNull);
      }

      Future<void> capture(String name) async {
        await settle();
        await tester.runAsync(() async {
          final boundary =
              boundaryKey.currentContext!.findRenderObject()
                  as RenderRepaintBoundary;
          final image = await boundary.toImage(pixelRatio: 1);
          final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
          final output = File('artifacts/previews/$name.png');
          await output.parent.create(recursive: true);
          await output.writeAsBytes(bytes!.buffer.asUint8List());
          image.dispose();
        });
      }

      await capture('dashboard-light');
      await tester.tap(find.byTooltip('Collapse sidebar'));
      await settle();
      await tester.tap(find.byTooltip('Dark mode'));
      await capture('dashboard-dark-collapsed');
      await tester.tap(find.byTooltip('Messages'));
      await capture('chat-dark');
      await tester.tap(find.byTooltip('Light mode'));
      await capture('chat-light');
      await tester.tap(find.byTooltip('Dark mode'));
      await settle();
      await tester.tap(find.byTooltip('Profile'));
      await capture('profile-dark');
      await tester.tap(find.byTooltip('Light mode'));
      await capture('profile-light');
      await tester.tap(find.byTooltip('AI Studio'));
      await capture('studio-light');
      await tester.tap(find.byTooltip('Dark mode'));
      await capture('studio-dark');
      await tester.tap(find.byTooltip('Light mode'));
      await settle();
      tester.view.physicalSize = const Size(390, 844);
      await settle();
      await capture('studio-mobile');
      await tester.tap(find.byTooltip('Open menu'));
      await settle();
      await tester.tap(find.text('Messages'));
      await capture('chat-mobile');
      tester.view.viewInsets = const FakeViewPadding(bottom: 280);
      await capture('chat-mobile-keyboard');
      tester.view.resetViewInsets();
      await tester.pumpWidget(const SizedBox());
    },
    skip: !const bool.fromEnvironment('NEXA_PREVIEWS'),
  );
}
