# Mobile Android 컨벤션 (Kotlin / Java)
> 기반: Google Android Style Guide + Kotlin Coding Conventions + Detekt
> 참조:
>   https://developer.android.com/kotlin/style-guide
>   https://kotlinlang.org/docs/coding-conventions.html
>   https://detekt.dev/

---

## 도구 스택

| 도구 | 역할 | 설정 파일 |
|------|------|-----------|
| **ktlint** | Kotlin 포맷터 + 린터 | `.editorconfig` |
| **Detekt** | 정적 분석 (복잡도, 코드 스멜) | `detekt.yml` |
| **Android Lint** | Android 특화 경고 | `lint.xml` |

---

## Gradle 설정 (`build.gradle.kts`)

```kotlin
plugins {
    id("io.gitlab.arturbosch.detekt") version "1.23.6"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.1"
}

// ktlint 설정
ktlint {
    version.set("1.3.0")
    android.set(true)
    ignoreFailures.set(false)
    reporters {
        reporter(ReporterType.PLAIN)
        reporter(ReporterType.CHECKSTYLE)
    }
    filter {
        exclude("**/generated/**")
        include("**/kotlin/**")
    }
}

// Detekt 설정
detekt {
    config.setFrom(files("$rootDir/detekt.yml"))
    buildUponDefaultConfig = true
    allRules = false
    parallel = true
}

// Android Lint
android {
    lint {
        abortOnError = true
        warningsAsErrors = true
        checkReleaseBuilds = true
        lintConfig = file("lint.xml")
        htmlReport = true
        xmlReport = true
    }
}

dependencies {
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.6")
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-rules-libraries:1.23.6")
}
```

---

## `detekt.yml` (Google/Netflix 기반 강화)

```yaml
build:
  maxIssues: 0
  excludeCorrectable: false

config:
  validation: true
  warningsAsErrors: true

complexity:
  ComplexMethod:
    active: true
    threshold: 10                    # Google: 복잡도 10 이하
  LongMethod:
    active: true
    threshold: 40                    # C-004 연동
  LongParameterList:
    active: true
    functionThreshold: 4
    constructorThreshold: 6
  TooManyFunctions:
    active: true
    thresholdInFiles: 20
    thresholdInClasses: 15
    thresholdInObjects: 15
  CyclomaticComplexMethod:
    active: true
    threshold: 10
  NestedBlockDepth:
    active: true
    threshold: 3                     # 중첩 3단계 제한

naming:
  ClassNaming:
    active: true
    classPattern: '[A-Z][a-zA-Z0-9]*'     # PascalCase
  FunctionNaming:
    active: true
    functionPattern: '[a-z][a-zA-Z0-9]*'  # camelCase
  VariableNaming:
    active: true
    variablePattern: '[a-z][a-zA-Z0-9]*'
  ConstantNaming:
    active: true
    constantPattern: '[A-Z][_A-Z0-9]*'    # UPPER_SNAKE_CASE
  PackageNaming:
    active: true
    packagePattern: '[a-z]+(\.[a-z][a-zA-Z0-9]*)*'
  TopLevelPropertyNaming:
    active: true
    constantPattern: '[A-Z][_A-Z0-9]*'
    propertyPattern: '[A-Za-z][_A-Za-z0-9]*'
    privatePropertyPattern: '_?[a-z][A-Za-z0-9]*'

style:
  MagicNumber:
    active: true
    ignoreNumbers: ['-1', '0', '1', '2']
    ignoreHashCodeFunction: true
    ignorePropertyDeclaration: true
  WildcardImport:
    active: true
    excludeImports: ['java.util.*', 'kotlinx.android.synthetic.*']
  UnusedImports:
    active: true
  NoConsecutiveBlankLines:
    active: true
  SerialVersionUIDInSerializableClass:
    active: true
  UnnecessaryAbstractClass:
    active: true

potential-bugs:
  LateinitUsage:
    active: true
    excludeAnnotatedProperties: ['Inject', 'Autowired', 'Mock']
  UnsafeCast:
    active: true
  NullableToStringCall:
    active: true

coroutines:
  GlobalCoroutineUsage:
    active: true     # GlobalScope 금지 (Netflix: 구조화된 동시성 강제)
  RedundantSuspendModifier:
    active: true
  SuspendFunWithCoroutineScopeReceiver:
    active: true

exceptions:
  TooGenericExceptionCaught:
    active: true
    exceptionNames:
      - Error
      - Exception
      - Throwable
      - RuntimeException
  TooGenericExceptionThrown:
    active: true
  SwallowedException:
    active: true
```

---

## `lint.xml` (Android Lint)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<lint>
  <!-- 심각도 격상 -->
  <issue id="HardcodedText" severity="error"/>
  <issue id="HardcodedDebugMode" severity="error"/>
  <issue id="SetTextI18n" severity="error"/>
  <issue id="RelativeOverlap" severity="warning"/>

  <!-- 보안 -->
  <issue id="AllowBackup" severity="error"/>
  <issue id="ExportedPreferenceActivity" severity="error"/>
  <issue id="SetWorldReadable" severity="error"/>
  <issue id="SetWorldWritable" severity="error"/>
  <issue id="UseCheckPermission" severity="error"/>
  <issue id="GrantAllUris" severity="error"/>

  <!-- 성능 -->
  <issue id="DrawAllocation" severity="warning"/>
  <issue id="Overdraw" severity="warning"/>
  <issue id="UseSparseArrays" severity="warning"/>

  <!-- 비활성화 -->
  <issue id="GradleDependency" severity="ignore"/>   <!-- 버전 자동화로 관리 -->
</lint>
```

---

## `.editorconfig` (ktlint)

```ini
root = true

[*.{kt,kts}]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 120               # Android: Google 120자 권장

# ktlint 규칙
ktlint_standard_no-wildcard-imports = enabled
ktlint_standard_import-ordering = enabled
ktlint_standard_function-signature = enabled
ktlint_standard_multiline-expression-wrapping = enabled
```

---

## 네이밍 컨벤션

| 항목 | 규칙 | 예시 |
|------|------|------|
| 패키지 | 소문자 | `com.company.feature.user` |
| 클래스/인터페이스 | PascalCase | `UserViewModel` |
| 함수/변수 | camelCase | `getUserById` |
| 상수 (companion) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 레이아웃 파일 | snake_case | `fragment_user_profile.xml` |
| 리소스 ID | snake_case | `tv_user_name`, `btn_submit` |
| ViewModel | `*ViewModel` | `UserProfileViewModel` |
| Repository | `*Repository` | `UserRepository` |
| UseCase | `*UseCase` | `GetUserUseCase` |

---

## 아키텍처 패턴 (Clean Architecture + MVVM)

```kotlin
// ✅ 레이어 구조 (C-001 연동)
// UI (Fragment/Activity) → ViewModel → UseCase → Repository → DataSource

// [Domain/UseCase] 비즈니스 로직 순수 함수
class GetUserUseCase(
    private val userRepository: UserRepository,
) {
    suspend operator fun invoke(userId: String): Result<User> =
        runCatching { userRepository.findById(userId) }
}

// [ViewModel] UI 상태 관리
class UserProfileViewModel(
    private val getUserUseCase: GetUserUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun loadUser(userId: String) {
        viewModelScope.launch {                  // GlobalScope 금지
            _uiState.value = UserUiState.Loading
            getUserUseCase(userId)
                .onSuccess { user ->
                    _uiState.value = UserUiState.Success(user)
                }
                .onFailure { error ->
                    _uiState.value = UserUiState.Error(error.message ?: "알 수 없는 오류")
                }
        }
    }
}

// [Repository] 경계 파싱 (C-002)
class UserRepositoryImpl(
    private val remoteDataSource: UserRemoteDataSource,
) : UserRepository {

    override suspend fun findById(id: String): User {
        val dto = remoteDataSource.fetchUser(id)    // DTO 수신
        return UserMapper.toDomain(dto)              // 경계 변환
    }
}

// ❌ 금지 패턴
class UserViewModel : ViewModel() {
    fun loadUser(id: String) {
        GlobalScope.launch { ... }    // GlobalScope 금지
    }
    var user: User? = null            // LiveData/StateFlow 없이 직접 노출 금지
}
```

---

## pre-commit 설정

```yaml
  - repo: local
    hooks:
      - id: android-ktlint
        name: ktlint
        language: system
        entry: ./gradlew ktlintCheck
        pass_filenames: false
        types: [kotlin]
      - id: android-detekt
        name: detekt
        language: system
        entry: ./gradlew detekt
        pass_filenames: false
      - id: android-lint
        name: Android Lint
        language: system
        entry: ./gradlew lint
        pass_filenames: false
```
