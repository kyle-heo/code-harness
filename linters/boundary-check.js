/**
 * linters/boundary-check.js
 * C-002: 경계 데이터 검증 누락 감지
 * C-006: TypeScript 타입 단언(as) 사용 금지
 */

const fs = require('fs');
const glob = require('glob');

// 경계 레이어: 외부 데이터 진입점
const BOUNDARY_LAYERS = ['repo', 'api', 'controller', 'handler', 'gateway'];

// 허용된 파싱 패턴
const VALID_PARSE_PATTERNS = [
  /\.parse\(/,          // zod, yup 등
  /\.safeParse\(/,
  /\.validate\(/,
  /\.decode\(/,         // io-ts
  /\.fromJson\(/,
  /Schema\.parse/,
  /Schema\.safeParse/,
];

// 위험한 패턴
const DANGEROUS_PATTERNS = [
  { pattern: / as [A-Z][a-zA-Z]+/, code: 'C-006', message: '타입 단언(as)은 금지입니다. 타입 가드 또는 스키마 파싱을 사용하십시오.' },
  { pattern: /<[A-Z][a-zA-Z]+>(?!\s*\()/, code: 'C-006', message: '제네릭 타입 단언은 금지입니다.' },
  { pattern: /JSON\.parse\([^)]+\)(?!\s*[;\n])(?!.*\.parse)/, code: 'C-002', message: 'JSON.parse 결과는 즉시 스키마 검증을 거쳐야 합니다.' },
];

// 외부 데이터 수신 패턴 (이 다음 줄에 파싱 없으면 위반)
const EXTERNAL_DATA_PATTERNS = [
  /await\s+.*\.findOne\(/,
  /await\s+.*\.findMany\(/,
  /await\s+.*\.query\(/,
  /req\.body/,
  /req\.query/,
  /req\.params/,
  /event\.body/,
  /JSON\.parse\(/,
];

function isBoundaryFile(filePath) {
  return BOUNDARY_LAYERS.some(layer =>
    filePath.toLowerCase().includes(`/${layer}/`) ||
    filePath.toLowerCase().includes(`/${layer}.`)
  );
}

function hasValidParsing(lines, lineIndex, lookahead = 3) {
  const window = lines.slice(lineIndex, lineIndex + lookahead).join('\n');
  return VALID_PARSE_PATTERNS.some(p => p.test(window));
}

function checkFile(filePath, content) {
  const violations = [];
  const lines = content.split('\n');
  const isBoundary = isBoundaryFile(filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // C-006: 타입 단언 감지 (전체 파일)
    for (const { pattern, code, message } of DANGEROUS_PATTERNS) {
      if (pattern.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        violations.push({ line: lineNum, message: `${code}: ${message}`, severity: 'error', constraint: code });
      }
    }

    // C-002: 경계 파일에서 외부 데이터 수신 후 파싱 누락 감지
    if (isBoundary) {
      const isExternalData = EXTERNAL_DATA_PATTERNS.some(p => p.test(line));
      if (isExternalData && !hasValidParsing(lines, i)) {
        violations.push({
          line: lineNum,
          message: `C-002: 외부 데이터 수신 후 스키마 검증(zod .parse 등)이 없습니다. 경계에서 즉시 파싱하십시오.`,
          severity: 'error',
          constraint: 'C-002'
        });
      }
    }
  }

  return violations;
}

function run(targetPath, options = {}) {
  const files = glob.sync(`${targetPath || 'src'}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*', '**/*.d.ts']
  });

  let totalViolations = 0;
  const report = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const violations = checkFile(file, content);
    if (violations.length > 0) {
      totalViolations += violations.length;
      report.push({ file, violations });
      if (!options.count) {
        violations.forEach(v => {
          console.error(`[${v.constraint}][${v.severity.toUpperCase()}] ${file}:${v.line} - ${v.message}`);
        });
      }
    }
  }

  if (options.count) {
    console.log(totalViolations);
    return totalViolations;
  }

  if (options.report) {
    console.log(JSON.stringify(report, null, 2));
  }

  if (totalViolations > 0) {
    console.error(`\nC-002/C-006 총 위반: ${totalViolations}건 (CI 블로킹)`);
    process.exit(1);
  } else {
    console.log('C-002/C-006: 경계 검증 및 타입 단언 검사 통과');
  }
}

const args = process.argv.slice(2);
const options = {
  count: args.includes('--count'),
  report: args.includes('--report'),
};
const target = args.find(a => !a.startsWith('--'));
run(target, options);
