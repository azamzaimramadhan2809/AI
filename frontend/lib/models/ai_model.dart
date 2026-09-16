class AIModel {
  final String id;
  final String name;
  final String description;
  final String category;
  final String prompt;
  final String personality;
  final String? avatar;
  final String assistantType;
  final bool memory;

  const AIModel({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.prompt,
    required this.personality,
    this.avatar,
    required this.assistantType,
    required this.memory,
  });

  factory AIModel.fromJson(Map<String, dynamic> json) => AIModel(
    id: json['id']?.toString() ?? '',
    name: json['name']?.toString() ?? 'Assistant',
    description: json['description']?.toString() ?? '',
    category: json['category']?.toString() ?? 'Assistant',
    prompt: json['prompt']?.toString() ?? '',
    personality: json['personality']?.toString() ?? '',
    avatar: json['avatar']?.toString(),
    assistantType: json['assistantType']?.toString() ?? 'desktop',
    memory: json['memory'] as bool? ?? true,
  );

  AIModel copyWith({bool? memory}) => AIModel(
    id: id,
    name: name,
    description: description,
    category: category,
    prompt: prompt,
    personality: personality,
    avatar: avatar,
    assistantType: assistantType,
    memory: memory ?? this.memory,
  );
}

class ApiResult<T> {
  final bool success;
  final String message;
  final T? data;

  const ApiResult({required this.success, required this.message, this.data});
}
