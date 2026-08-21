import { validateThemeTokens } from '../contrastValidator';

export function runContrastValidation(): { allPassed: boolean; report: string[] } {
  const checks = validateThemeTokens();
  const report: string[] = [];
  let allPassed = true;

  report.push('==================================================');
  report.push('RESUMORA DESIGN SYSTEM TOKEN CONTRAST AUDIT (WCAG 2.2 AA)');
  report.push('==================================================');

  checks.forEach((check) => {
    const status = check.pass ? 'PASS ✅' : 'FAIL ❌';
    if (!check.pass) allPassed = false;
    report.push(
      `[${check.theme.toUpperCase()}] ${check.pairName.padEnd(30)}: ${check.contrastRatio}:1 (Required: ${check.minRequiredRatio}:1) -> ${status}`
    );
  });

  report.push('==================================================');
  report.push(allPassed ? 'ALL TOKEN CONTRAST CHECKS PASSED 100% (WCAG AA COMPLIANT).' : 'SOME CONTRAST CHECKS FAILED.');
  
  return { allPassed, report };
}

// Execute immediately when imported for verification
const result = runContrastValidation();
console.log(result.report.join('\n'));
