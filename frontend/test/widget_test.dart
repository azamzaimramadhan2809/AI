import 'package:flutter_test/flutter_test.dart';
import 'package:jarvis/main.dart';

void main() {
  testWidgets('Auth screen renders login mode by default', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MyApp());
    // The auth screen intentionally contains ambient looping animations.
    await tester.pump(const Duration(milliseconds: 900));

    expect(find.text('Masuk'), findsWidgets);
    expect(find.text('Daftar Akun'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Kata Sandi'), findsOneWidget);
    expect(find.text('Masuk ke NexaSmart'), findsOneWidget);
  });
}
