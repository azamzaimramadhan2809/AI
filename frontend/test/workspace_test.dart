import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:jarvis/models/ai_model.dart';
import 'package:jarvis/models/auth_model.dart';
import 'package:jarvis/screens/home_screen.dart';
import 'package:jarvis/screens/chat_page.dart';
import 'package:jarvis/screens/dashboard_page.dart';
import 'package:jarvis/services/nexa_service.dart';

const assistant = AIModel(
  id: 'ai-1',
  name: 'Loki',
  description: 'Personal assistant',
  category: 'Assistant',
  prompt: '',
  personality: 'Friendly',
  assistantType: 'desktop',
  memory: false,
);
final user = UserModel(id: 'u1', username: 'Zaim', email: 'zaim@example.com');

void main() {
  testWidgets('Memory-on history survives remount on a narrow screen', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final saved = <Map<String, dynamic>>[];
    final service = NexaService(
      token: 'test',
      client: MockClient((request) async {
        if (request.url.path.endsWith('/history')) {
          return http.Response(
            jsonEncode({'success': true, 'data': saved}),
            200,
          );
        }
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['memory'], true);
        expect(body.containsKey('sessionHistory'), false);
        saved.addAll([
          {'role': 'USER', 'content': body['content']},
          {'role': 'ASSISTANT', 'content': 'Persistent reply'},
        ]);
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {'reply': 'Persistent reply'},
          }),
          200,
        );
      }),
    );
    Widget page() => MaterialApp(
      home: Scaffold(
        body: ChatPage(
          service: service,
          assistants: [assistant.copyWith(memory: true)],
          onAIUpdated: (_) {},
          onCreateAI: () {},
        ),
      ),
    );
    await tester.pumpWidget(page());
    await tester.pump(const Duration(milliseconds: 600));
    await tester.enterText(find.byType(TextField), 'Remember this');
    await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpWidget(page());
    await tester.pump(const Duration(milliseconds: 600));
    expect(find.text('Persistent reply'), findsOneWidget);
    expect(find.text('Remember this'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 500));
  });
  testWidgets('Desktop sidebar collapses, theme changes, profile opens', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1200, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(MaterialApp(home: HomeScreen(user: user)));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('NexaSmart- AI'), findsOneWidget);
    await tester.tap(find.byTooltip('Collapse sidebar'));
    await tester.pump(const Duration(milliseconds: 120));
    expect(tester.takeException(), isNull);
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('Messages'), findsNothing);
    await tester.tap(find.byTooltip('Dark mode'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(
      Theme.of(tester.element(find.byType(DashboardPage))).brightness,
      Brightness.dark,
    );
    await tester.tap(find.byTooltip('Profile'));
    await tester.pump();
    expect(find.text('Your profile'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 500));
  });

  testWidgets('Phone layout and drawer fit narrow display', (tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(MaterialApp(home: HomeScreen(user: user)));
    await tester.pump(const Duration(milliseconds: 500));
    expect(tester.takeException(), isNull);
    await tester.tap(find.byTooltip('Open menu'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));
    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Your profile'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 500));
  });

  testWidgets('AI dashboard card selects its assistant', (tester) async {
    AIModel? selected;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DashboardPage(
            user: user,
            assistants: const [assistant],
            onCreateAI: () {},
            onOpenChat: (ai) => selected = ai,
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 500));
    await tester.ensureVisible(find.text('Loki'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Loki'));
    expect(selected?.id, 'ai-1');
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(milliseconds: 500));
  });

  testWidgets(
    'Memory off preserves session, reopening restores only server history',
    (tester) async {
      final sent = <Map<String, dynamic>>[];
      var historyCalls = 0;
      final service = NexaService(
        token: 'test',
        client: MockClient((request) async {
          if (request.url.path.endsWith('/history')) {
            historyCalls++;
            expect(request.url.queryParameters['aiId'], 'ai-1');
            return http.Response(
              jsonEncode({
                'success': true,
                'data': [
                  {'role': 'USER', 'content': 'Saved question'},
                  {'role': 'ASSISTANT', 'content': 'Saved answer'},
                ],
              }),
              200,
            );
          }
          sent.add(jsonDecode(request.body) as Map<String, dynamic>);
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {'reply': 'Temporary answer'},
            }),
            200,
          );
        }),
      );
      Widget page() => MaterialApp(
        home: Scaffold(
          body: ChatPage(
            service: service,
            assistants: const [assistant],
            onAIUpdated: (_) {},
            onCreateAI: () {},
          ),
        ),
      );
      await tester.pumpWidget(page());
      await tester.pump(const Duration(milliseconds: 500));
      expect(find.text('Saved answer'), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'Temporary question');
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pump(const Duration(milliseconds: 500));
      await tester.pump(const Duration(milliseconds: 500));
      expect(find.text('Temporary answer'), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'Follow up');
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pump(const Duration(milliseconds: 500));
      expect(sent.last['memory'], false);
      expect(
        (sent.last['sessionHistory'] as List).any(
          (m) => m['content'] == 'Temporary answer',
        ),
        true,
      );
      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 500));
      await tester.pumpWidget(page());
      await tester.pump(const Duration(milliseconds: 500));
      expect(historyCalls, 2);
      expect(find.text('Saved answer'), findsOneWidget);
      expect(find.text('Temporary answer'), findsNothing);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 500));
    },
  );
}
