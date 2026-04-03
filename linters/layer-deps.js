/**
 * linters/layer-deps.js
 * C-001: 레이어 의존성 방향 검사
 * 상위 레이어가 하위 레이어를 import하는 위반을 감지합니다.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const LAYER_ORDER = ['types', 'config', 'repo', 'service', 'runtime', 'ui'];
const PROVIDERS_PATH = 'providers/';

const CROSS_CUTTING = ['auth', 'telemetry', 'featureFlags', 'connectors'];

function getLayerIndex(filePath) {
  const normalized = filePath.toLowerCase().replace(/\\/g, '/');
  for (let i = 0; i < LAYER_ORDER.length; i++) {
    if (normalized.includes(`/${LAYER_ORDER[i]}/`) ||
        normalized.includes(`/${LAYER_ORDER[i]}.`)) {
      return i;
    }
  }
  return -1;
}

function checkFile(filePath, content) {
  const violations = [];
  const fileLayerIndex = getLayerIndex(filePath);
  if (fileLayerIndex === -1) return violations;

  // import 구문 추출
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  let lineNum = 0;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const importMatch = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/.exec(line);
    if (!importMatch) continue;

    const importPath = importMatch[1];
    const importLayerIndex = getLayerIndex(importPath);

    // 역방향 의존성 감지
    if (importLayerIndex > fileLayerIndex) {
      violations.push({
        line: i + 1,
        message: `C-001: ${LAYER_ORDER[fileLayerIndex]} 레이어가 ${LAYER_ORDER[importLayerIndex]} 레이어를 import합니다. 역방향 의존성 금지.`,
        severity: 'error',
        constraint: 'C-001'
      });
    }

    // 횡단 관심사 직접 접근 감지
    if (CROSS_CUTTING.some(cc => importPath.includes(cc)) &&
        !importPath.includes(PROVIDERS_PATH)) {
      violations.push({
        line: i + 1,
        message: `C-001: 횡단 관심사(${importPath})는 providers/ 인터페이스를 통해서만 접근 가능합니다.`,
        severity: 'error',
        constraint: 'C-001'
      });
    }
  }

  return violations;
}

function run(targetPath, options = {}) {
  const files = glob.sync(`${targetPath || 'src'}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
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
          console.error(`[C-001][${v.severity.toUpperCase()}] ${file}:${v.line} - ${v.message}`);
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
    console.error(`\nC-001 총 위반: ${totalViolations}건 (CI 블로킹)`);
    process.exit(1);
  } else {
    console.log('C-001: 레이어 의존성 검사 통과');
  }
}

const args = process.argv.slice(2);
const options = {
  count: args.includes('--count'),
  report: args.includes('--report'),
};
const target = args.find(a => !a.startsWith('--'));
run(target, options);
