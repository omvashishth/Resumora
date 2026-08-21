import { runAuthServiceVerification } from '../src/services/__tests__/authService.test.ts';

async function main() {
  console.log('Running test suite...');
  
  const authResult = await runAuthServiceVerification();
  console.log(authResult.log.join('\n'));

  if (!authResult.success) {
    console.error('Auth verification failed!');
    process.exit(1);
  }

  const { runTemplateSelectionVerification } = await import('../src/templates/__tests__/templateSelection.test');
  const tmplResult = await runTemplateSelectionVerification();
  console.log('\n' + tmplResult.log.join('\n'));

  if (!tmplResult.success) {
    console.error('Template verification failed!');
    process.exit(1);
  }

  console.log('\nAll test suites passed successfully!');
}

main().catch((err) => {
  console.error('Fatal error in test execution:', err);
  process.exit(1);
});
