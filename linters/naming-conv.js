/**
 * linters/naming-conv.js
 * C-003: 구조화 로깅 (console.log 직접 사용 금지)
 * C-005: 공유 유틸리티 우선 사용
 * C-007: 스키마/타입 네이밍 컨벤션
 */

const fs = require('fs');
const glob = require('glob');

// C-003: 직접 콘솔 사용 패턴
const CONSOLE_PATTERNS = [
  { pattern: /console\.(log|warn|error|info|debug)\(/, message: 'C-003: console.* 직접 사용 금지. providers/telemetry.ts의 logger를 사용하십시오.' },
];

// C-005: 공유 유틸리티로 대체해야 할 직접 구현 패턴
const REINVENT_PATTERNS = [
  { pattern: /function\s+(?:format|parse)Date/, shared: 'shared/utils/date', message: 'C-005: 날짜 포맷/파싱은 shared/utils/date를 사용하십시오.' },
  { pattern: /function\s+(?:slugify|toSlug)/, shared: 'shared/utils/string', message: 'C-005: slug 변환은 shared/utils/string을 사용하십시오.' },
  { pattern: /function\s+(?:paginate|buildPagination)/, shared: 'shared/utils/pagination', message: 'C-005: 페이지네이션은 shared/utils/pagination을 사용하십시오.' },
  { pattern: /function\s+(?:hashPassword|comparePassword)/, shared: 'providers/auth', message: 'C-005: 패스워드 처리는 providers/auth.ts를 사용하십시오.' },
];

// C-007: 네이밍 컨벤션
const NAMING_PATTERNS = [
  {
    // 스키마 변수명은 *Schema 접미사 필수
    pattern: /const\s+(\w+)\s*=\s*(?:z\.object|z\.string|z\.number|yup\.object)/,
    check: (match) => !match[1].endsWith('Schema'),
    message: (match) => `C-007: "${match[1]}"는 Schema 접미사가 필요합니다. "${match[1]}Schema"로 변경하십시오.`
  },
  {
    // DTO 클래스는 *Dto 접미사 필수
    pattern: /class\s+(\w+Dto)?\s/,
    check: (match) => match[0].includes('class ') && !match[0].includes('Dto') && match[0].includes('Dto') === false && /class\s+\w+\s/.test(match[0]) && !/class\s+\w+Dto/.test(match[0]) && /Request|Response|Input|Output/.test(match[0]),
    message: (match) => `C-007: 데이터 전송 객체는 Dto 접미사를 사용하십시오.`
  },
];

function checkFile(filePath, content) {
  const violations = [];
  const lines = content.split('\n');
  const isTest = filePath.includes('.test.') || filePath.includes('.spec.');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 주석 줄 건너뜀
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    // C-003: console.* 감지 (테스트 파일 제외)
    if (!isTest) {
      for (const { pattern, message } of CONSOLE_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({ line: lineNum, message, severity: 'warn', constraint: 'C-003' });
        }
      }
    }

    // C-005: 공유 유틸리티 재구현 감지
    for (const { pattern, message } of REINVENT_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({ line: lineNum, message, severity: 'warn', constraint: 'C-005' });
      }
    }

    // C-007: 스키마 네이밍
    const schemaMatch = /const\s+(\w+)\s*=\s*z\.object/.exec(line);
    if (schemaMatch && !schemaMatch[1].endsWith('Schema')) {
      violations.push({
        line: lineNum,
        message: `C-007: "${schemaMatch[1]}"는 Schema 접미사가 필요합니다. "${schemaMatch[1]}Schema"로 변경하십시오.`,
        severity: 'warn',
        constraint: 'C-007'
      });
    }
  }

  return violations;
}

function run(targetPath, options = {}) {
  const files = glob.sync(`${targetPath || 'src'}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ['**/node_modules/**', '**/*.d.ts']
  });

  let errorCount = 0;
  let warnCount = 0;
  const report = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const violations = checkFile(file, content);
    if (violations.length > 0) {
      violations.forEach(v => {
        if (v.severity === 'error') errorCount++;
        else warnCount++;
      });
      report.push({ file, violations });
      if (!options.count) {
        violations.forEach(v => {
          const level = v.severity === 'error' ? 'ERROR' : 'WARN';
          console[v.severity === 'error' ? 'error' : 'warn'](`[${v.constraint}][${level}] ${file}:${v.line} - ${v.message}`);
        });
      }
    }
  }

  const totalViolations = errorCount + warnCount;

  if (options.count) {
    console.log(totalViolations);
    return totalViolations;
  }

  if (options.report) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\nC-003/C-005/C-007: 에러 ${errorCount}건, 경고 ${warnCount}건`);

  // C-003 누적 경고 3회 이상 시 블로킹
  const c003Count = report.flatMap(r => r.violations).filter(v => v.constraint === 'C-003').length;
  if (c003Count >= 3) {
    console.error(`C-003 누적 경고 ${c003Count}건 -> CI 블로킹`);
    process.exit(1);
  }

  if (errorCount > 0) {
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const options = {
  count: args.includes('--count'),
  report: args.includes('--report'),
};
const target = args.find(a => !a.startsWith('--'));
run(target, options);
