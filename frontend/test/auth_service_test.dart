import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:jarvis/services/auth_service.dart';

void main() {
  group('AuthService Tests', () {
    test('login returns success and user model on 200', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/api/auth/login');
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Login successful',
            'data': {
              'token': 'mock-jwt-token',
              'user': {
                'id': 'user-123',
                'username': 'john_doe',
                'email': 'john@example.com',
                'displayName': 'John Doe',
                'role': 'user',
                'isVerified': true,
              },
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final authService = AuthService(client: mockClient);
      final result = await authService.login(
        email: 'john@example.com',
        password: 'password123',
      );

      expect(result.success, isTrue);
      expect(result.token, 'mock-jwt-token');
      expect(result.user?.username, 'john_doe');
      expect(result.user?.displayName, 'John Doe');
      expect(result.message, 'Login successful');
    });

    test('login returns failure message on 401 invalid credentials', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Invalid email or password',
          }),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      final authService = AuthService(client: mockClient);
      final result = await authService.login(
        email: 'wrong@example.com',
        password: 'wrongpassword',
      );

      expect(result.success, isFalse);
      expect(result.message, 'Invalid email or password');
      expect(result.user, isNull);
    });

    test('register returns success and user model on 201', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/api/auth/register');
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'User registered successfully',
            'data': {
              'id': 'user-456',
              'username': 'new_user',
              'email': 'new@example.com',
              'displayName': 'New User',
              'role': 'user',
              'isVerified': false,
            },
          }),
          201,
          headers: {'content-type': 'application/json'},
        );
      });

      final authService = AuthService(client: mockClient);
      final result = await authService.register(
        username: 'new_user',
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      );

      expect(result.success, isTrue);
      expect(result.message, 'User registered successfully');
      expect(result.user?.username, 'new_user');
      expect(result.user?.email, 'new@example.com');
    });

    test('register returns failure with issues on validation error', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Invalid request',
            'issues': [
              {
                'path': 'password',
                'message': 'String must contain at least 8 character(s)',
              },
            ],
          }),
          400,
          headers: {'content-type': 'application/json'},
        );
      });

      final authService = AuthService(client: mockClient);
      final result = await authService.register(
        username: 'usr',
        email: 'usr@example.com',
        password: 'short',
      );

      expect(result.success, isFalse);
      expect(
        result.message,
        contains('password: String must contain at least 8 character(s)'),
      );
      expect(result.issues?.length, 1);
    });
  });
}
