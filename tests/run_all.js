#!/usr/bin/env node
/**
 * tests/run_all.js
 * 
 * Production-grade Standalone E2E CLI Test Runner.
 * Executes Tiers 1-4 test suites with progressive diagnostics and zero external dependencies.
 * 
 * Usage:
 *   node tests/run_all.js [options]
 * 
 * Options:
 *   --tier, -t <1|2|3|4>    Run only specified tier(s)
 *   --filter, -f <pattern>   Filter tests by title pattern
 *   --file <path>            Target custom HTML file (default: index.html)
 *   --verbose, -v            Verbose output for all tests
 *   --help, -h               Show help menu
 */

const fs = require('fs');
const path = require('path');
const { resetRegistry, getSuites, getAssertionCount, resetTestAssertionCount, getTestAssertionCount, AssertionError } = require('./test_harness.js');

// ANSI color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tiers: [],
    hasTierArg: false,
    rawTiers: '',
    filter: null,
    verbose: false,
    file: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--tier' || arg === '-t') {
      options.hasTierArg = true;
      i++;
      if (args[i]) {
        options.rawTiers = args[i];
        const t = args[i].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        options.tiers.push(...t);
      }
    } else if (arg.startsWith('--tier=')) {
      options.hasTierArg = true;
      const val = arg.slice(7);
      options.rawTiers = val;
      const t = val.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
      options.tiers.push(...t);
    } else if (arg === '--filter' || arg === '-f') {
      i++;
      if (args[i]) options.filter = args[i];
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.slice(9);
    } else if (arg === '--file') {
      i++;
      if (args[i]) options.file = path.resolve(process.cwd(), args[i]);
    } else if (arg.startsWith('--file=')) {
      options.file = path.resolve(process.cwd(), arg.slice(7));
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${c.bold}${c.cyan}Raycast Landing Page E2E Test Runner${c.reset}
${c.dim}Zero-dependency Node.js headless testing framework for index.html${c.reset}

${c.bold}USAGE:${c.reset}
  node tests/run_all.js [options]

${c.bold}OPTIONS:${c.reset}
  ${c.green}-t, --tier <1|2|3|4>${c.reset}     Run only specified test tier(s) (e.g. --tier 1 or --tier 1,3)
  ${c.green}-f, --filter <pattern>${c.reset}   Filter tests matching regex or string
  ${c.green}--file <path>${c.reset}            Path to target index.html (default: ./index.html)
  ${c.green}-v, --verbose${c.reset}            Show real-time output for every test
  ${c.green}-h, --help${c.reset}               Display this help guide

${c.bold}TIER SPECIFICATIONS:${c.reset}
  ${c.cyan}Tier 1:${c.reset} Feature Coverage (>=5 tests per feature across all 22 features = 110 tests)
  ${c.cyan}Tier 2:${c.reset} Boundary & Corner Cases (>=5 boundary tests per feature = 110 tests)
  ${c.cyan}Tier 3:${c.reset} Cross-Feature Interactions (>=30 pairwise component tests)
  ${c.cyan}Tier 4:${c.reset} Real-World Scenarios (>=25 tests across 5 end-to-end user journeys)
`);
}

// Tier definitions
const TIERS = [
  { id: 1, name: 'Tier 1: Feature Coverage', file: 'tier1_features.test.js' },
  { id: 2, name: 'Tier 2: Boundary & Corner Cases', file: 'tier2_boundaries.test.js' },
  { id: 3, name: 'Tier 3: Cross-Feature Interactions', file: 'tier3_pairwise.test.js' },
  { id: 4, name: 'Tier 4: Real-World Scenarios', file: 'tier4_realworld.test.js' }
];

async function runTestItem(testItem, suiteChain, options) {
  // Run beforeEach hooks from root to current
  for (const s of suiteChain) {
    for (const hook of s.beforeEachHooks) {
      await hook();
    }
  }

  resetTestAssertionCount();
  const startTime = Date.now();
  let error = null;

  try {
    const res = testItem.fn();
    if (res && typeof res.then === 'function') {
      await res;
    }
    if (getTestAssertionCount() === 0) {
      throw new AssertionError('Test completed with 0 assertions executed. Every test must execute at least one assertion.');
    }
  } catch (err) {
    error = err;
  }

  const duration = Date.now() - startTime;

  // Run afterEach hooks from current to root
  for (let i = suiteChain.length - 1; i >= 0; i--) {
    for (const hook of suiteChain[i].afterEachHooks) {
      try {
        await hook();
      } catch (err) {
        if (!error) error = err;
      }
    }
  }

  return {
    title: testItem.title,
    duration,
    passed: !error,
    error
  };
}

async function runSuiteTree(suite, chain, options, tierResults) {
  const currentChain = [...chain, suite];

  // Run beforeAll hooks for this suite
  for (const hook of suite.beforeAllHooks) {
    try {
      await hook();
    } catch (err) {
      console.error(`${c.red}Error in beforeAll hook of "${suite.title}":${c.reset}`, err.message);
    }
  }

  // Run tests in this suite
  for (const t of suite.tests) {
    if (options.filter && !t.title.toLowerCase().includes(options.filter.toLowerCase())) {
      continue;
    }

    tierResults.total++;
    const res = await runTestItem(t, currentChain, options);

    if (res.passed) {
      tierResults.passed++;
      if (options.verbose) {
        console.log(`  ${c.green}✓${c.reset} ${t.title} ${c.dim}(${res.duration}ms)${c.reset}`);
      }
    } else {
      tierResults.failed++;
      tierResults.failures.push({
        suite: suite.title,
        title: t.title,
        error: res.error,
        duration: res.duration
      });
      if (options.verbose) {
        console.log(`  ${c.red}✗${c.reset} ${t.title} ${c.dim}(${res.duration}ms)${c.reset}`);
        console.log(`    ${c.red}${res.error.message}${c.reset}`);
      }
    }
  }

  // Run subSuites recursively
  for (const sub of suite.subSuites) {
    await runSuiteTree(sub, currentChain, options, tierResults);
  }

  // Run afterAll hooks for this suite
  for (const hook of suite.afterAllHooks) {
    try {
      await hook();
    } catch (err) {
      console.error(`${c.red}Error in afterAll hook of "${suite.title}":${c.reset}`, err.message);
    }
  }
}

async function executeTier(tierConfig, options) {
  resetRegistry();
  const testFilePath = path.join(__dirname, tierConfig.file);

  if (!fs.existsSync(testFilePath)) {
    return {
      id: tierConfig.id,
      name: tierConfig.name,
      file: tierConfig.file,
      total: 0,
      passed: 0,
      failed: 1,
      failures: [{
        suite: tierConfig.name,
        title: `Load ${tierConfig.file}`,
        error: new Error(`Test file not found: ${testFilePath}`),
        duration: 0
      }],
      duration: 0
    };
  }

  // Set env target file if specified
  if (options.file) {
    process.env.TARGET_INDEX_HTML = options.file;
  }

  try {
    // Clear module cache to re-execute cleanly
    delete require.cache[require.resolve(testFilePath)];
    require(testFilePath);
  } catch (err) {
    return {
      id: tierConfig.id,
      name: tierConfig.name,
      file: tierConfig.file,
      total: 0,
      passed: 0,
      failed: 1,
      failures: [{
        suite: tierConfig.name,
        title: `Load ${tierConfig.file}`,
        error: err,
        duration: 0
      }],
      duration: 0
    };
  }

  const suites = getSuites();
  const tierResults = {
    id: tierConfig.id,
    name: tierConfig.name,
    file: tierConfig.file,
    total: 0,
    passed: 0,
    failed: 0,
    failures: [],
    duration: 0
  };

  const start = Date.now();

  for (const rootSuite of suites) {
    await runSuiteTree(rootSuite, [], options, tierResults);
  }

  tierResults.duration = Date.now() - start;
  return tierResults;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.white} Raycast Landing Page E2E Test Suite Runner (Zero-Dependency Standard Library)${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================================================${c.reset}`);

  const targetHtmlPath = options.file || path.resolve(__dirname, '..', 'index.html');
  const fileExists = fs.existsSync(targetHtmlPath);

  console.log(`${c.dim}Target Deliverable:${c.reset} ${targetHtmlPath}`);
  if (fileExists) {
    const stats = fs.statSync(targetHtmlPath);
    console.log(`${c.dim}Status:${c.reset} ${c.green}Present${c.reset} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`${c.dim}Status:${c.reset} ${c.yellow}Pending${c.reset} (Under active development by M1/M2/M3)`);
    console.log(`${c.yellow}[PROGRESSIVE TESTABILITY MODE]${c.reset} Executing tests against diagnostic document.`);
    console.log(`${c.dim}Missing markup and dynamic features will be diagnosed cleanly below.${c.reset}`);
  }

  if (options.filter) {
    console.log(`${c.dim}Test Filter:${c.reset} "${options.filter}"`);
  }

  const selectedTiers = options.tiers.length > 0
    ? TIERS.filter(t => options.tiers.includes(t.id))
    : TIERS;

  console.log(`${c.dim}Active Tiers:${c.reset} ${selectedTiers.map(t => t.id).join(', ')}`);
  console.log(`${c.bold}${c.cyan}--------------------------------------------------------------------------------${c.reset}\n`);

  const allResults = [];
  const overallStart = Date.now();

  for (const tierConfig of selectedTiers) {
    process.stdout.write(`Executing ${c.bold}${tierConfig.name}${c.reset} (${tierConfig.file})... `);
    const tierStart = Date.now();
    const res = await executeTier(tierConfig, options);
    const timeStr = `${Date.now() - tierStart}ms`;

    if (res.failed === 0) {
      console.log(`${c.green}${c.bold}PASSED${c.reset} (${res.passed}/${res.total} tests) in ${timeStr}`);
    } else {
      console.log(`${c.red}${c.bold}FAILED${c.reset} (${res.passed} passed, ${c.red}${res.failed} failed${c.reset}/${res.total}) in ${timeStr}`);
    }

    allResults.push(res);
  }

  const overallDuration = Date.now() - overallStart;
  const totalTests = allResults.reduce((acc, r) => acc + r.total, 0);
  const totalPassed = allResults.reduce((acc, r) => acc + r.passed, 0);
  const totalFailed = allResults.reduce((acc, r) => acc + r.failed, 0);
  const totalAssertions = getAssertionCount();

  // Print Summary Table
  console.log(`\n${c.bold}${c.cyan}================================================================================${c.reset}`);
  console.log(`${c.bold}${c.white}                             E2E TEST SUMMARY MATRIX                            ${c.reset}`);
  console.log(`${c.bold}${c.cyan}================================================================================${c.reset}`);
  console.log(`| ${c.bold}Tier${c.reset} | ${c.bold}Name${c.reset.padEnd(41)} | ${c.bold}Total${c.reset} | ${c.bold}Passed${c.reset} | ${c.bold}Failed${c.reset} | ${c.bold}Time${c.reset}    |`);
  console.log(`|------|-------------------------------------------|-------|--------|--------|---------|`);

  for (const r of allResults) {
    const tierId = `T${r.id}`.padEnd(4);
    const name = r.name.padEnd(41);
    const tot = String(r.total).padStart(5);
    const pass = `${c.green}${String(r.passed).padStart(6)}${c.reset}`;
    const fail = r.failed > 0
      ? `${c.red}${String(r.failed).padStart(6)}${c.reset}`
      : `${String(r.failed).padStart(6)}`;
    const time = `${r.duration}ms`.padStart(7);
    console.log(`| ${tierId} | ${name} | ${tot} | ${pass} | ${fail} | ${time} |`);
  }

  console.log(`|------|-------------------------------------------|-------|--------|--------|---------|`);
  console.log(`| ${c.bold}SUM${c.reset}  | ${c.bold}All Selected Tiers${c.reset.padEnd(41)} | ${String(totalTests).padStart(5)} | ${c.green}${String(totalPassed).padStart(6)}${c.reset} | ${totalFailed > 0 ? `${c.red}${String(totalFailed).padStart(6)}${c.reset}` : `${String(totalFailed).padStart(6)}`} | ${`${overallDuration}ms`.padStart(7)} |`);
  console.log(`${c.bold}${c.cyan}================================================================================${c.reset}\n`);

  console.log(`${c.bold}Overall Execution Metrics:${c.reset}`);
  console.log(`  • Total Tests Executed:     ${c.bold}${totalTests}${c.reset}`);
  console.log(`  • Tests Passed:             ${c.green}${c.bold}${totalPassed}${c.reset}`);
  console.log(`  • Tests Failed:             ${totalFailed > 0 ? `${c.red}${c.bold}${totalFailed}${c.reset}` : '0'}`);
  console.log(`  • Total Assertions:         ${c.bold}${totalAssertions}${c.reset}`);
  console.log(`  • Total Execution Time:     ${c.bold}${overallDuration}ms${c.reset} (${(overallDuration / 1000).toFixed(2)}s)`);

  // Failure Diagnostics
  if (totalFailed > 0) {
    console.log(`\n${c.bold}${c.yellow}================================================================================${c.reset}`);
    console.log(`${c.bold}${c.yellow}                          PROGRESSIVE FAILURE DIAGNOSTICS                       ${c.reset}`);
    console.log(`${c.bold}${c.yellow}================================================================================${c.reset}`);
    
    for (const r of allResults) {
      if (r.failures.length > 0) {
        console.log(`\n${c.bold}${c.red}► ${r.name} (${r.failures.length} failures):${c.reset}`);
        for (const f of r.failures) {
          console.log(`  ${c.red}✗${c.reset} [${f.suite}] ${f.title}`);
          console.log(`    ${c.dim}${f.error.message}${c.reset}`);
        }
      }
    }

    if (!fileExists) {
      console.log(`\n${c.yellow}${c.bold}DIAGNOSTIC NOTE:${c.reset}`);
      console.log(`${c.dim}Failures are expected in Progressive Testability mode because index.html has not yet`);
      console.log(`been generated by Milestone 1 (M1). As M1, M2, and M3 deliver DOM structure, styles,`);
      console.log(`and scripts, these failures will turn into green passing assertions without any modifications`);
      console.log(`to the test suite.${c.reset}\n`);
    }

    process.exit(1);
  } else {
    console.log(`\n${c.green}${c.bold}✔ ALL TESTS PASSED! 100% SUCCESS ACROSS ALL SELECTED TIERS.${c.reset}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`${c.red}Fatal Runner Error:${c.reset}`, err);
  process.exit(1);
});
