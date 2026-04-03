# Backend Java 컨벤션
> 기반: Google Java Style Guide + Netflix Checkstyle + Spring 공식 권고
> 참조:
>   https://google.github.io/styleguide/javaguide.html
>   https://github.com/Netflix/netflix-commons/blob/master/codequality/checkstyle.xml
>   https://github.com/checkstyle/checkstyle

---

## 도구 스택

| 도구 | 역할 | 설정 파일 |
|------|------|-----------|
| Checkstyle | 코드 스타일 강제 | `checkstyle.xml` |
| PMD | 버그 패턴 및 코드 품질 | `pmd-rules.xml` |
| SpotBugs | 바이트코드 수준 버그 탐지 | `spotbugs-exclusions.xml` |
| google-java-format | 자동 포맷터 | Maven/Gradle 플러그인 |

---

## Maven 설정 (`pom.xml`)

```xml
<build>
  <plugins>
    <!-- google-java-format 자동 포맷 -->
    <plugin>
      <groupId>com.spotify.fmt</groupId>
      <artifactId>fmt-maven-plugin</artifactId>
      <version>2.23</version>
      <executions>
        <execution>
          <goals><goal>format</goal></goals>
        </execution>
      </executions>
    </plugin>

    <!-- Checkstyle -->
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-checkstyle-plugin</artifactId>
      <version>3.4.0</version>
      <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <failsOnError>true</failsOnError>
        <consoleOutput>true</consoleOutput>
      </configuration>
      <executions>
        <execution>
          <id>validate</id>
          <phase>validate</phase>
          <goals><goal>check</goal></goals>
        </execution>
      </executions>
    </plugin>

    <!-- PMD -->
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-pmd-plugin</artifactId>
      <version>3.23.0</version>
      <configuration>
        <rulesets><ruleset>pmd-rules.xml</ruleset></rulesets>
        <failOnViolation>true</failOnViolation>
        <printFailingErrors>true</printFailingErrors>
      </configuration>
      <executions>
        <execution>
          <goals><goal>check</goal></goals>
        </execution>
      </executions>
    </plugin>

    <!-- SpotBugs -->
    <plugin>
      <groupId>com.github.spotbugs</groupId>
      <artifactId>spotbugs-maven-plugin</artifactId>
      <version>4.8.6.2</version>
      <configuration>
        <effort>Max</effort>
        <threshold>Low</threshold>
        <excludeFilterFile>spotbugs-exclusions.xml</excludeFilterFile>
      </configuration>
      <executions>
        <execution>
          <goals><goal>check</goal></goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

---

## `checkstyle.xml` (Google Style 기반 + Netflix 강화)

```xml
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
  "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
  "https://checkstyle.org/dtds/configuration_1_3.dtd">

<module name="Checker">
  <property name="charset" value="UTF-8"/>
  <property name="severity" value="error"/>
  <property name="fileExtensions" value="java"/>

  <!-- 파일 레벨 -->
  <module name="FileTabCharacter">
    <property name="eachLine" value="true"/>
  </module>
  <module name="NewlineAtEndOfFile"/>
  <module name="FileLength">
    <property name="max" value="500"/>  <!-- ARCHITECTURE.md C-004 연동 -->
  </module>

  <module name="TreeWalker">
    <!-- ── 포맷 (Google Style) ── -->
    <module name="Indentation">
      <property name="basicOffset" value="2"/>
      <property name="braceAdjustment" value="0"/>
      <property name="caseIndent" value="2"/>
    </module>
    <module name="LineLength">
      <property name="max" value="100"/>  <!-- Google: 100자 제한 -->
      <property name="ignorePattern" value="^package.*|^import.*|a href|href|http://|https://|ftp://"/>
    </module>
    <module name="WhitespaceAround"/>
    <module name="NoWhitespaceAfter"/>
    <module name="NoWhitespaceBefore"/>
    <module name="OperatorWrap">
      <property name="option" value="NL"/>
    </module>

    <!-- ── 네이밍 (Google Style) ── -->
    <module name="PackageName">
      <property name="format" value="^[a-z]+(\.[a-z][a-z0-9]*)*$"/>
    </module>
    <module name="TypeName"/>                  <!-- PascalCase -->
    <module name="MemberName"/>               <!-- camelCase -->
    <module name="MethodName"/>              <!-- camelCase -->
    <module name="ParameterName"/>           <!-- camelCase -->
    <module name="LocalVariableName"/>       <!-- camelCase -->
    <module name="ConstantName">
      <property name="format" value="^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$"/>
    </module>

    <!-- ── Import ── -->
    <module name="AvoidStarImport"/>          <!-- import * 금지 -->
    <module name="UnusedImports"/>
    <module name="ImportOrder">
      <property name="groups" value="java,javax,org,com"/>
      <property name="separated" value="true"/>
      <property name="option" value="above"/>
    </module>

    <!-- ── 코드 복잡도 (Netflix 기준 강화) ── -->
    <module name="CyclomaticComplexity">
      <property name="max" value="10"/>
    </module>
    <module name="MethodLength">
      <property name="max" value="40"/>        <!-- C-004 연동: Service 40줄 -->
    </module>
    <module name="ParameterNumber">
      <property name="max" value="4"/>
    </module>
    <module name="ClassFanOutComplexity">
      <property name="max" value="15"/>
    </module>

    <!-- ── 블록 스타일 (K&R, Google) ── -->
    <module name="LeftCurly"/>
    <module name="RightCurly"/>
    <module name="NeedBraces"/>              <!-- 단일 문장도 {} 필수 -->

    <!-- ── 버그 방지 ── -->
    <module name="EqualsHashCode"/>          <!-- equals override 시 hashCode 필수 -->
    <module name="StringLiteralEquality"/>   <!-- == 대신 .equals() -->
    <module name="FallThrough"/>            <!-- switch fall-through 방지 -->
    <module name="MissingSwitchDefault"/>   <!-- switch default 필수 -->
    <module name="MultipleVariableDeclarations"/>
    <module name="ModifiedControlVariable"/>

    <!-- ── JavaDoc ── -->
    <module name="JavadocMethod">
      <property name="scope" value="public"/>
      <property name="allowMissingParamTags" value="false"/>
      <property name="allowMissingReturnTag" value="false"/>
    </module>
    <module name="JavadocType">
      <property name="scope" value="public"/>
    </module>

    <!-- ── 보안 관련 ── -->
    <module name="IllegalInstantiation">
      <property name="classes" value="java.lang.Boolean"/>
    </module>
    <module name="VisibilityModifier">
      <property name="packageAllowed" value="false"/>
      <property name="protectedAllowed" value="true"/>
    </module>
  </module>
</module>
```

---

## `pmd-rules.xml`

```xml
<?xml version="1.0"?>
<ruleset name="Custom PMD Rules"
  xmlns="http://pmd.sourceforge.net/ruleset/2.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://pmd.sourceforge.net/ruleset/2.0.0 https://pmd.sourceforge.io/ruleset_2_0_0.xsd">

  <description>Netflix/Google 기반 커스텀 PMD 룰셋</description>

  <!-- Best Practices -->
  <rule ref="category/java/bestpractices.xml">
    <exclude name="GuardLogStatement"/>     <!-- SLF4J 사용 시 불필요 -->
    <exclude name="JUnitTestContainsTooManyAsserts"/>
  </rule>

  <!-- 코드 품질 -->
  <rule ref="category/java/codestyle.xml">
    <exclude name="OnlyOneReturn"/>         <!-- 조기 반환 허용 -->
    <exclude name="AtLeastOneConstructor"/>
    <exclude name="CommentDefaultAccessModifier"/>
  </rule>

  <!-- 버그 감지 -->
  <rule ref="category/java/errorprone.xml">
    <exclude name="BeanMembersShouldSerialize"/>
  </rule>

  <!-- 성능 -->
  <rule ref="category/java/performance.xml"/>

  <!-- 보안 -->
  <rule ref="category/java/security.xml"/>

  <!-- 복잡도 설정 오버라이드 -->
  <rule ref="category/java/design.xml/CyclomaticComplexity">
    <properties>
      <property name="methodReportLevel" value="10"/>
      <property name="classReportLevel" value="80"/>
    </properties>
  </rule>
  <rule ref="category/java/design.xml/TooManyMethods">
    <properties>
      <property name="maxmethods" value="20"/>
    </properties>
  </rule>
</ruleset>
```

---

## EditorConfig (`.editorconfig`)

```ini
root = true

[*.java]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 100
```

---

## 네이밍 컨벤션

| 항목 | 규칙 | 예시 |
|------|------|------|
| 패키지 | 소문자 | `com.company.user.service` |
| 클래스 | PascalCase | `UserService`, `UserRepository` |
| 인터페이스 | PascalCase (I 접두사 X) | `UserRepository` |
| 메서드 | camelCase | `findUserById` |
| 변수 | camelCase | `userId`, `maxRetryCount` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| enum | PascalCase / UPPER_SNAKE_CASE 값 | `UserStatus.ACTIVE` |

---

## Spring Boot 특화 패턴

```java
// ✅ 레이어 구조 (C-001 연동: ARCHITECTURE.md 방향 준수)
// Controller (UI 레이어) → Service → Repository → Entity(Types)

// [Controller] 파라미터 검증은 경계에서 (C-002)
@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {

    private final UserService userService;

    // 생성자 주입 (필드 주입 금지)
    public UserController(final UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody final CreateUserRequest request) {
        final User user = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponse.from(user));
    }
}

// [Service] 비즈니스 로직만
@Service
@Transactional(readOnly = true)  // 기본 readOnly, 변경 메서드에만 @Transactional
public class UserService {

    public User create(final CreateUserRequest request) {
        validateEmail(request.getEmail());
        return userRepository.save(User.create(request));
    }

    private void validateEmail(final String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException(email);
        }
    }
}

// ❌ 금지 패턴
@Autowired                          // 필드 주입 금지
private UserService userService;

String query = "SELECT * FROM users WHERE id = " + id;  // SQL 인젝션
```

---

## pre-commit 설정 (`.pre-commit-config.yaml` 추가)

```yaml
  - repo: local
    hooks:
      - id: java-checkstyle
        name: Checkstyle
        language: system
        entry: mvn checkstyle:check -q
        types: [java]
        pass_filenames: false
      - id: java-format
        name: google-java-format
        language: system
        entry: mvn fmt:format
        types: [java]
        pass_filenames: false
```
