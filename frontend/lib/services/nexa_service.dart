import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../core/constants/api_constants.dart';
import '../models/ai_model.dart';
import '../models/auth_model.dart';

class NexaService {
  final String token;
  final http.Client _client;

  NexaService({required this.token, http.Client? client})
    : _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  Future<ApiResult<List<AIModel>>> getAIs() async {
    try {
      final response = await _client.get(
        Uri.parse(ApiConstants.aiUrl),
        headers: _headers,
      );
      final json = _decode(response);
      if (response.statusCode == 200 && json['success'] == true) {
        final items = (json['data'] as List? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(AIModel.fromJson)
            .toList();
        return ApiResult(success: true, message: '', data: items);
      }
      return ApiResult(success: false, message: _message(json));
    } catch (error) {
      return ApiResult(success: false, message: _networkMessage(error));
    }
  }

  Future<ApiResult<AIModel>> createAI(Map<String, dynamic> input) async {
    try {
      final response = await _client.post(
        Uri.parse(ApiConstants.aiUrl),
        headers: _headers,
        body: jsonEncode(input),
      );
      final json = _decode(response);
      if (response.statusCode == 201 && json['success'] == true) {
        return ApiResult(
          success: true,
          message: json['message']?.toString() ?? 'AI berhasil dibuat',
          data: AIModel.fromJson(json['data'] as Map<String, dynamic>),
        );
      }
      return ApiResult(success: false, message: _message(json));
    } catch (error) {
      return ApiResult(success: false, message: _networkMessage(error));
    }
  }

  Future<ApiResult<AIModel>> setMemory(AIModel ai, bool enabled) async {
    try {
      final response = await _client.put(
        Uri.parse('${ApiConstants.aiUrl}/${ai.id}'),
        headers: _headers,
        body: jsonEncode({'memory': enabled}),
      );
      final json = _decode(response);
      if (response.statusCode == 200 && json['success'] == true) {
        return ApiResult(
          success: true,
          message: 'Memory ${enabled ? 'aktif' : 'nonaktif'}',
          data: AIModel.fromJson(json['data'] as Map<String, dynamic>),
        );
      }
      return ApiResult(success: false, message: _message(json));
    } catch (error) {
      return ApiResult(success: false, message: _networkMessage(error));
    }
  }

  Future<ApiResult<String>> sendMessage({
    required AIModel ai,
    required String content,
    required bool memory,
    List<Map<String, String>> sessionHistory = const [],
  }) async {
    try {
      final response = await _client.post(
        Uri.parse(ApiConstants.chatUrl),
        headers: _headers,
        body: jsonEncode({
          'aiId': ai.id,
          'content': content,
          'memory': memory,
          if (!memory) 'sessionHistory': sessionHistory,
        }),
      );
      final json = _decode(response);
      if (response.statusCode == 200 && json['success'] == true) {
        final data = json['data'] as Map<String, dynamic>?;
        return ApiResult(
          success: true,
          message: '',
          data: data?['reply']?.toString() ?? '',
        );
      }
      return ApiResult(success: false, message: _message(json));
    } catch (error) {
      return ApiResult(success: false, message: _networkMessage(error));
    }
  }

  Future<ApiResult<List<Map<String, dynamic>>>> getHistory(String aiId) async {
    try {
      final response = await _client.get(
        Uri.parse(
          '${ApiConstants.baseUrl}/api/chat/history',
        ).replace(queryParameters: {'aiId': aiId}),
        headers: _headers,
      );
      final json = _decode(response);
      if (response.statusCode == 200 && json['success'] == true) {
        return ApiResult(
          success: true,
          message: '',
          data: (json['data'] as List).cast<Map<String, dynamic>>(),
        );
      }
      return ApiResult(success: false, message: _message(json));
    } catch (error) {
      return ApiResult(success: false, message: _networkMessage(error));
    }
  }

  Future<ApiResult<UserModel>> updateProfile({
    required String username,
    required String displayName,
    String? avatar,
  }) async {
    try {
      final response = await _client.put(
        Uri.parse(ApiConstants.profileUrl),
        headers: _headers,
        body: jsonEncode(
          <String, dynamic>{
            'username': username.trim(),
            'displayName': displayName.trim(),
          }..addAll(avatar == null ? const {} : {'avatar': avatar}),
        ),
      );
      final json = _decode(response);
      if (response.statusCode == 200 && json['success'] == true) {
        return ApiResult(
          success: true,
          message: 'Profil berhasil diperbarui',
          data: UserModel.fromJson(json['data'] as Map<String, dynamic>),
        );
      }
      return ApiResult(success: false, message: _message(json));
    } catch (error) {
      return ApiResult(success: false, message: _networkMessage(error));
    }
  }

  Map<String, dynamic> _decode(http.Response response) {
    try {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      return {
        'message': 'Respons server tidak dapat dibaca (${response.statusCode})',
      };
    }
  }

  String _message(Map<String, dynamic> json) {
    if (json['issues'] is List) {
      final issues = (json['issues'] as List)
          .whereType<Map>()
          .map((item) => item['message']?.toString())
          .whereType<String>()
          .toList();
      if (issues.isNotEmpty) return issues.join('\n');
    }
    return json['message']?.toString() ?? 'Terjadi kesalahan pada server';
  }

  String _networkMessage(Object error) => error is SocketException
      ? 'Backend tidak terhubung. Pastikan server berjalan.'
      : 'Gagal memproses permintaan: $error';
}
