import { runAuthServiceVerification } from '../src/services/__tests__/authService.test.ts';
import { runTemplateSelectionVerification } from '../src/templates/__tests__/templateSelection.test.ts';
import { runPhase321Verification } from '../src/ai/__tests__/phase321.test.ts';
import { runPhase322Verification } from '../src/ai/__tests__/phase322.test.ts';
import { runPhase323SecurityVerification } from '../src/ai/__tests__/phase323.test.ts';
import { runATSScoreEngineVerification } from '../src/utils/__tests__/atsScoreEngine.test.ts';
import { runImportAndPhotoExportVerification } from '../src/services/__tests__/importAndPhotoExport.test.ts';
import { runMonetizationAndLimitsVerification } from '../src/services/__tests__/monetizationAndLimits.test.ts';

async function main() {
  console.log('====================================================');
  console.log('RESUMORA MASTER TEST & VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Auth Service Verification
  const authResult = await runAuthServiceVerification();
  console.log(authResult.log.join('\n'));
  if (!authResult.success) {
    console.error('\n❌ Auth verification failed!');
    process.exit(1);
  }

  // 2. Template Selection & Photo Capabilities
  const tmplResult = await runTemplateSelectionVerification();
  console.log('\n' + tmplResult.log.join('\n'));
  if (!tmplResult.success) {
    console.error('\n❌ Template verification failed!');
    process.exit(1);
  }

  // 3. Phase 3.2.1 AI Assistant & Configuration Isolation
  const ai321Result = await runPhase321Verification();
  console.log('\n' + ai321Result.log.join('\n'));
  if (!ai321Result.success) {
    console.error('\n❌ Phase 3.2.1 AI verification failed!');
    process.exit(1);
  }

  // 4. Phase 3.2.2 Dual AI Provider System (CVForge AI + BYOK)
  const ai322Result = await runPhase322Verification();
  console.log('\n' + ai322Result.log.join('\n'));
  if (!ai322Result.success) {
    console.error('\n❌ Phase 3.2.2 AI verification failed!');
    process.exit(1);
  }

  // 5. Phase 3.2.3 AI Credential Security & Redaction Hardening
  const ai323Result = await runPhase323SecurityVerification();
  console.log('\n' + ai323Result.log.join('\n'));
  if (!ai323Result.success) {
    console.error('\n❌ Phase 3.2.3 AI security verification failed!');
    process.exit(1);
  }

  // 6. Live ATS Scoring Engine & Job Description Keyword Matcher
  const atsResult = await runATSScoreEngineVerification();
  console.log('\n' + atsResult.log.join('\n'));
  if (!atsResult.success) {
    console.error('\n❌ ATS Score Engine verification failed!');
    process.exit(1);
  }

  // 7. Resume Import & Photo PDF/DOCX Export
  const importPhotoResult = await runImportAndPhotoExportVerification();
  console.log('\n' + importPhotoResult.log.join('\n'));
  if (!importPhotoResult.success) {
    console.error('\n❌ Import & Photo Export verification failed!');
    process.exit(1);
  }

  // 8. India-First Monetization, 1-Free Export & Stripe Pro Activation
  const monetizationResult = await runMonetizationAndLimitsVerification();
  console.log('\n' + monetizationResult.log.join('\n'));
  if (!monetizationResult.success) {
    console.error('\n❌ Monetization & Limits verification failed!');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 8 TEST SUITES PASSED 100% SUCCESSFULLY!');
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Fatal error in test execution:', err);
  process.exit(1);
});
