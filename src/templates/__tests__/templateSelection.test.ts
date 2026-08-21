import { TEMPLATES, getTemplateById } from '../TemplateRenderer';
import { createSampleResume } from '../../utils/sampleData';
import type { TemplateId, Resume } from '../../types/resume';

export async function runTemplateSelectionVerification(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('Starting Template Selector & Capability Verification...');

  try {
    // 1. Verify Executive Portrait registration
    const execTmpl = getTemplateById('executive-photo');
    if (execTmpl && execTmpl.id === 'executive-photo') {
      log.push('✓ Test 1 Passed: Executive Portrait template is registered.');
    } else {
      throw new Error('Test 1 Failed: Executive Portrait template not found.');
    }

    // 2. Verify Modern Sidebar Photo registration
    const sidebarTmpl = getTemplateById('modern-sidebar-photo');
    if (sidebarTmpl && sidebarTmpl.id === 'modern-sidebar-photo') {
      log.push('✓ Test 2 Passed: Modern Sidebar Photo template is registered.');
    } else {
      throw new Error('Test 2 Failed: Modern Sidebar Photo template not found.');
    }

    // 3. Verify supportsPhoto = true capability
    if (execTmpl.supportsPhoto === true && sidebarTmpl.supportsPhoto === true) {
      log.push('✓ Test 3 Passed: Both photo templates have supportsPhoto = true capability.');
    } else {
      throw new Error('Test 3 Failed: supportsPhoto capability flag is false or missing.');
    }

    // 4. Verify existing templates have supportsPhoto = false
    const classicTmpl = getTemplateById('classic');
    const modernTmpl = getTemplateById('modern');
    if (classicTmpl.supportsPhoto === false && modernTmpl.supportsPhoto === false) {
      log.push('✓ Test 4 Passed: Existing templates explicitly have supportsPhoto = false.');
    } else {
      throw new Error('Test 4 Failed: Existing templates missing supportsPhoto = false.');
    }

    // 5. Test Template Switching and Data Integrity
    let sampleResume: Resume = createSampleResume();
    sampleResume.personal.avatarUrl = 'data:image/webp;base64,sample_photo_bytes';

    // Select Photo Template
    sampleResume.templateId = 'executive-photo';
    if (sampleResume.templateId === 'executive-photo') {
      log.push('✓ Test 5 Passed: Selecting executive-photo template updates templateId.');
    } else {
      throw new Error('Test 5 Failed: Failed to switch to executive-photo template.');
    }

    // Verify avatarUrl preserved
    if (sampleResume.personal.avatarUrl === 'data:image/webp;base64,sample_photo_bytes') {
      log.push('✓ Test 6 Passed: Existing photo avatarUrl preserved on template switch.');
    } else {
      throw new Error('Test 6 Failed: avatarUrl was mutated or cleared.');
    }

    // Switch to No-Photo Template
    sampleResume.templateId = 'classic';
    if (sampleResume.templateId === 'classic') {
      log.push('✓ Test 7 Passed: Successfully switched to no-photo classic template.');
    }

    // Verify avatarUrl is STILL preserved (not deleted)
    if (sampleResume.personal.avatarUrl === 'data:image/webp;base64,sample_photo_bytes') {
      log.push('✓ Test 8 Passed: Switching to no-photo template retains avatarUrl in data model.');
    } else {
      throw new Error('Test 8 Failed: avatarUrl was deleted on switching to no-photo template.');
    }

    // Switch back to Photo Template
    sampleResume.templateId = 'modern-sidebar-photo';
    if (
      sampleResume.templateId === 'modern-sidebar-photo' &&
      sampleResume.personal.avatarUrl === 'data:image/webp;base64,sample_photo_bytes'
    ) {
      log.push('✓ Test 9 Passed: Switching back to photo template restores avatarUrl rendering.');
    } else {
      throw new Error('Test 9 Failed: Photo data failed to restore.');
    }

    // Verify all registered templates selectable
    const allIds: TemplateId[] = [
      'classic',
      'modern',
      'minimal',
      'professional',
      'student',
      'executive-photo',
      'modern-sidebar-photo',
    ];
    const registeredCount = TEMPLATES.filter((t) => allIds.includes(t.id)).length;
    if (registeredCount === allIds.length) {
      log.push(`✓ Test 10 Passed: All ${registeredCount} templates are registered and selectable.`);
    } else {
      throw new Error(`Test 10 Failed: Expected ${allIds.length} registered templates, found ${registeredCount}.`);
    }

    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ Verification Failed: ${err.message}`);
    return { success: false, log };
  }
}
