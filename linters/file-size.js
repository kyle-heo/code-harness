/**
 * linters/file-size.js
 * C-004: 레이어별 파일 크기 제한
 * ARCHITECTURE.md에 정의된 라인 수 기준을 적용합니다.
 */

const fs = require('fs');
const glob = require('glob');

// ARCHITECTURE.md 기준 레이어별 최대 라인 수
const LAYER_LIMITS = {
  types:   200,
  config:  150,
  repo:    300,
  service: 400,
  runtime: 300,
  ui:      250,
};

function detectLayer(filePath) {
  const normalized = filePath.toLowerCase().replace(/\\/g, '/');
  for (const [layer, limit] of Object.entries(LAYER_LIMITS)) {
    if (normalized.includes(`/${layer}/`) || normalized.includes(`/${layer}.`)) {
      return { layer, limit };
    }
  }
  return null;
}

function countLines(content) {
  // 빈 줄과 주석 전용 줄 제외한 실질적 코드 라인
  return content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*') && trimmed !== '*/';
  }).length;
}

function checkFile(filePath, content) {
  const violations = [];
  const layerInfo = detectLayer(filePath);
  if (!layerInfo) return violations;

  const { layer, limit } = layerInfo;
  const lineCount = countLines(content);
  const ratio = lineCount / limit;

  if (ratio > 2.0) {
    violations.push({
      line: lineCount,
      message: `C-004: ${layer} 레이어 파일이 ${lineCount}줄입니다 (제한: ${limit}줄, ${Math.round(ratio * 100)}%). CI 블로킹.`,
      severity: 'error',
      constraint: 'C-004',
      lineCount,
      limit,
      ratio
    });
  } else if (ratio > 1.0) {
    violations.push({
      line: lineCount,
      message: `C-004: ${layer} 레이어 파일이 ${lineCount}줄입니다 (제한: ${limit}줄, ${Math.round(ratio * 100)}%). 분리를 권장합니다.`,
      severity: 'warn',
      constraint: 'C-004',
      lineCount,
      limit,
      ratio
    });
  }

  return violations;
}

function run(targetPath, options = {}) {
  const files = glob.sync(`${targetPath || 'src'}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*', '**/*.d.ts']
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
          console[v.severity === 'error' ? 'error' : 'warn'](
            `[C-004][${level}] ${file}: ${v.message}`
          );
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
    // quality-grader가 소비하는 JSON 리포트
    const summary = {
      totalViolations,
      errors: errorCount,
      warnings: warnCount,
      worstFiles: report
        .sort((a, b) => b.violations[0].ratio - a.violations[0].ratio)
        .slice(0, 5)
        .map(r => ({ file: r.file, lines: r.violations[0].lineCount, limit: r.violations[0].limit }))
    };
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`\nC-004 파일 크기 검사: 에러 ${errorCount}건, 경고 ${warnCount}건`);

  if (errorCount > 0) {
    console.error('200% 초과 파일 존재 -> CI 블로킹');
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
