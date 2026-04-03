# Mobile iOS 컨벤션 (Swift)
> 기반: Google Swift Style Guide + Swift API Design Guidelines + SwiftLint
> 참조:
>   https://google.github.io/swift/
>   https://www.swift.org/documentation/api-design-guidelines/
>   https://github.com/realm/SwiftLint

---

## 도구 스택

| 도구 | 역할 | 설정 파일 |
|------|------|-----------|
| **SwiftLint** | 린터 + 스타일 강제 | `.swiftlint.yml` |
| **SwiftFormat** | 자동 포맷터 | `.swiftformat` |
| **periphery** | 미사용 코드 감지 | `.periphery.yml` |

---

## SwiftLint 설치 및 Xcode 연동

```bash
# SPM으로 설치 (Package.swift)
.package(url: "https://github.com/realm/SwiftLint", from: "0.56.0")

# Xcode Build Phase 스크립트 추가
if which swiftlint > /dev/null; then
  swiftlint
else
  echo "warning: SwiftLint not installed, download from https://github.com/realm/SwiftLint"
fi
```

---

## `.swiftlint.yml` (Google Swift Style + Airbnb 패턴)

```yaml
# 활성화할 규칙 (included + opt-in)
included:
  - Sources
  - Tests

excluded:
  - Pods
  - .build
  - DerivedData
  - Generated           # 코드 생성 파일 제외

# 비활성화 규칙
disabled_rules:
  - todo                          # TODO 주석 허용 (exec-plan 연동)
  - multiple_closures_with_trailing_closure

# 선택적 활성화 규칙 (opt-in)
opt_in_rules:
  # 코드 품질
  - array_init
  - closure_end_indentation
  - closure_spacing
  - collection_alignment
  - contains_over_filter_count
  - contains_over_filter_is_empty
  - contains_over_first_not_nil
  - contains_over_range_nil_comparison
  - discouraged_object_literal
  - empty_collection_literal
  - empty_count
  - empty_string
  - enum_case_associated_values_count
  - explicit_init
  - fallthrough
  - fatal_error_message
  - first_where
  - flatmap_over_map_reduce
  - identical_operands
  - joined_default_parameter
  - last_where
  - legacy_multiple
  - literal_expression_end_indentation
  - lower_acl_than_parent
  - modifier_order
  - multiline_arguments
  - multiline_function_chains
  - multiline_literal_brackets
  - multiline_parameters
  - operator_usage_whitespace
  - optional_enum_case_matching
  - overridden_super_call
  - prefer_self_type_over_type_of_self
  - redundant_nil_coalescing
  - redundant_type_annotation
  - single_test_class
  - sorted_first_last
  - static_operator
  - strong_iboutlet
  - toggle_bool
  - trailing_closure
  - type_contents_order
  - unneeded_parentheses_in_closure_argument
  - untyped_error_in_catch
  - vertical_parameter_alignment_on_call
  - vertical_whitespace_closing_braces
  - vertical_whitespace_opening_braces
  - yoda_condition

# 규칙 설정
line_length:
  warning: 120
  error: 150
  ignores_comments: true
  ignores_urls: true

file_length:
  warning: 400
  error: 500                      # C-004 연동

function_body_length:
  warning: 40
  error: 60                       # C-004 연동

type_body_length:
  warning: 200
  error: 300

cyclomatic_complexity:
  warning: 10
  error: 15                       # Google: 복잡도 제한

nesting:
  type_level:
    warning: 2
  function_level:
    warning: 3                    # 중첩 3단계 제한

identifier_name:
  min_length:
    error: 2
  max_length:
    warning: 40
    error: 60
  excluded:
    - id
    - x
    - y
    - z
    - i
    - j
    - k

type_name:
  min_length:
    error: 3
  max_length:
    warning: 40
    error: 60

# 커스텀 규칙
custom_rules:
  no_print:
    name: "No print statements"
    message: "print()는 금지입니다. os_log 또는 Logger를 사용하십시오. (C-003)"
    regex: '^\s*print\s*\('
    severity: error

  no_force_unwrap:
    name: "No force unwrap"
    message: "강제 언래핑(!)은 금지입니다. guard let 또는 if let을 사용하십시오."
    regex: '(?<![!<])!(?![=,\)])'
    match_kinds:
      - identifier
    severity: warning

  no_force_cast:
    name: "No force cast"
    message: "강제 캐스팅(as!)은 금지입니다. as? 를 사용하십시오."
    regex: '\bas!\b'
    severity: error

  use_logger:
    name: "Use Logger instead of NSLog"
    message: "NSLog 대신 Logger(subsystem:category:)를 사용하십시오."
    regex: '\bNSLog\b'
    severity: error

  explicit_self:
    name: "Explicit self in closures"
    message: "클로저 내에서는 self를 명시하십시오."
    regex: '\[weak self\]'
    severity: suggestion
```

---

## `.swiftformat`

```
--swiftversion 5.9
--indent 4
--tabwidth 4
--maxwidth 120
--wraparguments before-first
--wrapparameters before-first
--wrapcollections before-first
--closingparen same-line
--commas inline
--semicolons never
--header strip
--importgrouping alphabetized
--trailingclosures always
--redundantself explicit
--self insert
```

---

## 네이밍 컨벤션 (Swift API Design Guidelines)

| 항목 | 규칙 | 예시 |
|------|------|------|
| 타입/프로토콜 | PascalCase | `UserRepository`, `UserRepositoryProtocol` |
| 함수/변수 | camelCase | `getUserById`, `isLoading` |
| 상수 | camelCase (대문자 아님) | `maxRetryCount` |
| 열거형 케이스 | camelCase | `.active`, `.pending` |
| 파일 | PascalCase | `UserProfileView.swift` |
| ViewModel | `*ViewModel` | `UserProfileViewModel` |
| View | `*View` | `UserProfileView` |
| 프로토콜 | 명사 또는 -able/-ing | `Identifiable`, `UserLoading` |

---

## 아키텍처 패턴 (Clean Architecture + SwiftUI)

```swift
// ✅ 레이어 구조 (C-001 연동)
// View → ViewModel → UseCase → Repository → DataSource

// [Domain/UseCase]
struct GetUserUseCase {
    let userRepository: UserRepositoryProtocol

    func execute(userId: String) async throws -> User {
        try await userRepository.findById(userId)
    }
}

// [ViewModel] ObservableObject 또는 @Observable
@Observable
final class UserProfileViewModel {
    private(set) var user: User?
    private(set) var isLoading = false
    private(set) var errorMessage: String?

    private let getUserUseCase: GetUserUseCase

    init(getUserUseCase: GetUserUseCase) {
        self.getUserUseCase = getUserUseCase
    }

    @MainActor
    func loadUser(id: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            user = try await getUserUseCase.execute(userId: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// [Repository] 경계 파싱 (C-002)
final class UserRepositoryImpl: UserRepositoryProtocol {
    private let dataSource: UserRemoteDataSource

    func findById(_ id: String) async throws -> User {
        let dto = try await dataSource.fetchUser(id: id)
        return UserMapper.toDomain(dto)              // 경계 변환
    }
}

// [View] 순수 뷰 (비즈니스 로직 없음)
struct UserProfileView: View {
    @State private var viewModel: UserProfileViewModel

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if let user = viewModel.user {
                UserDetailView(user: user)
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error)
            }
        }
        .task { await viewModel.loadUser(id: userId) }
    }
}

// ❌ 금지 패턴
class ViewController: UIViewController {
    var user: User?              // 직접 상태 관리 금지 (ViewModel 사용)

    func loadUser() {
        let result = try! api.fetch()  // force try 금지
        let user = result as! User     // 강제 캐스팅 금지
        print("로드 완료: \(user)")   // print 금지
    }
}
```

---

## 로깅 패턴 (C-003)

```swift
// ✅ 구조화 로깅 (os.log 기반)
import OSLog

extension Logger {
    private static let subsystem = Bundle.main.bundleIdentifier!
    static let network = Logger(subsystem: subsystem, category: "network")
    static let ui = Logger(subsystem: subsystem, category: "ui")
    static let data = Logger(subsystem: subsystem, category: "data")
}

// 사용
Logger.network.info("사용자 로드 시작: \(userId)")
Logger.network.error("사용자 로드 실패: \(error.localizedDescription)")

// ❌ 금지
print("사용자 로드")
NSLog("디버그: %@", userId)
```

---

## pre-commit 설정

```yaml
  - repo: local
    hooks:
      - id: swiftlint
        name: SwiftLint
        language: system
        entry: swiftlint lint --strict
        types: [swift]
        pass_filenames: false
      - id: swiftformat
        name: SwiftFormat
        language: system
        entry: swiftformat --lint .
        types: [swift]
        pass_filenames: false
```
