import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/auth_model.dart';

class AuthService {
  final http.Client _client;

  AuthService({http.Client? client}) : _client = client ?? http.Client();

  /// Login with email and password
  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse(ApiConstants.loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim(), 'password': password}),
      );

      final Map<String, dynamic> json = jsonDecode(response.body);

      if (response.statusCode == 200 && json['success'] == true) {
        final data = json['data'] as Map<String, dynamic>;
        final token = data['token'] as String?;
        final user = data['user'] != null
            ? UserModel.fromJson(data['user'] as Map<String, dynamic>)
            : null;

        return AuthResult(
          success: true,
          message: json['message'] as String? ?? 'Login berhasil',
          token: token,
          user: user,
        );
      } else {
        return _handleErrorResponse(response.statusCode, json);
      }
    } on SocketException {
      return AuthResult(
        success: false,
        message:
            'Gagal terhubung ke backend. Pastikan server backend berjalan.',
      );
    } catch (e) {
      return AuthResult(
        success: false,
        message: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Register a new account
  Future<AuthResult> register({
    required String username,
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final Map<String, dynamic> requestBody = {
        'username': username.trim(),
        'email': email.trim(),
        'password': password,
      };

      if (displayName != null && displayName.trim().isNotEmpty) {
        requestBody['displayName'] = displayName.trim();
      }

      final response = await _client.post(
        Uri.parse(ApiConstants.registerUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final Map<String, dynamic> json = jsonDecode(response.body);

      if (response.statusCode == 201 && json['success'] == true) {
        final data = json['data'] as Map<String, dynamic>?;
        final user = data != null ? UserModel.fromJson(data) : null;

        return AuthResult(
          success: true,
          message: json['message'] as String? ?? 'Registrasi berhasil',
          user: user,
        );
      } else {
        return _handleErrorResponse(response.statusCode, json);
      }
    } on SocketException {
      return AuthResult(
        success: false,
        message:
            'Gagal terhubung ke backend. Pastikan server backend berjalan.',
      );
    } catch (e) {
      return AuthResult(
        success: false,
        message: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Helper to extract error message and validation issues from backend response
  AuthResult _handleErrorResponse(int statusCode, Map<String, dynamic> json) {
    String message =
        json['message'] as String? ?? 'Terjadi kesalahan ($statusCode)';
    List<String> issuesList = [];

    if (json['issues'] is List) {
      for (final item in json['issues'] as List) {
        if (item is Map && item['message'] != null) {
          final path = item['path'] != null ? '${item['path']}: ' : '';
          issuesList.add('$path${item['message']}');
        }
      }
    }

    if (issuesList.isNotEmpty) {
      message = issuesList.join('\n');
    }

    return AuthResult(
      success: false,
      message: message,
      issues: issuesList.isNotEmpty ? issuesList : null,
    );
  }
}
