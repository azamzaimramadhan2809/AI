import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jarvis/models/auth_model.dart';
import 'package:jarvis/screens/auth_screen.dart';
import 'package:jarvis/screens/home_screen.dart';
import 'package:jarvis/widgets/workspace_ui.dart';

void main() {
  testWidgets(
    'Sidebar stays within bounds through both directions at fractional scaling',
    (tester) async {
      tester.view.physicalSize = const Size(1500, 1000);
      tester.view.devicePixelRatio = 1.25;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(
            user: UserModel(
              id: 'test',
              username: 'Zaim',
              email: 'test@example.com',
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 500));
      for (final tooltip in [
        'Collapse sidebar',
        'Expand sidebar',
        'Collapse sidebar',
      ]) {
        await tester.tap(find.byTooltip(tooltip));
        await tester.pump();
        for (var frame = 0; frame < 10; frame++) {
          await tester.pump(const Duration(milliseconds: 40));
          expect(tester.takeException(), isNull);
        }
      }
      final button = tester.getCenter(find.byTooltip('Expand sidebar'));
      final dashboard = tester.getCenter(find.byTooltip('Dashboard'));
      expect(button.dy, greaterThan(78));
      expect(button.dy, lessThan(dashboard.dy));
      await tester.pumpWidget(const SizedBox());
    },
  );

  testWidgets(
    'Auth shrinks smoothly from register to login without layout errors',
    (tester) async {
      tester.view.physicalSize = const Size(1200, 1000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(
        const MaterialApp(home: AuthScreen(initialMode: AuthMode.register)),
      );
      await tester.pump(const Duration(milliseconds: 800));
      await tester.tap(find.text('Masuk').first);
      await tester.pump();
      for (var i = 0; i < 12; i++) {
        await tester.pump(const Duration(milliseconds: 40));
        expect(tester.takeException(), isNull);
      }
      expect(find.byKey(const ValueKey(AuthMode.register)), findsNothing);
      expect(find.byKey(const ValueKey(AuthMode.login)), findsOneWidget);
      await tester.tap(find.text('Daftar Akun').first);
      await tester.pump();
      for (var i = 0; i < 12; i++) {
        await tester.pump(const Duration(milliseconds: 40));
        expect(tester.takeException(), isNull);
      }
      expect(find.byKey(const ValueKey(AuthMode.register)), findsOneWidget);
      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 500));
    },
  );

  testWidgets('Typing indicator respects reduced motion and disposes cleanly', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: TypingDots())),
    );
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.bySemanticsLabel('AI is thinking'), findsOneWidget);
    await tester.pumpWidget(
      const MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(disableAnimations: true),
          child: Scaffold(body: TypingDots()),
        ),
      ),
    );
    await tester.pump(const Duration(seconds: 2));
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
  });
}
