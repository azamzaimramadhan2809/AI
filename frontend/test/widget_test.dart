import 'package:flutter_test/flutter_test.dart';
import 'package:jarvis/main.dart';

void main() {
  testWidgets('Auth screen renders login mode by default', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    expect(find.text('Masuk'), findsWidgets);
    expect(find.text('Daftar Akun'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Kata Sandi'), findsOneWidget);
    expect(find.text('Masuk ke Jarvis'), findsOneWidget);
  });
}
