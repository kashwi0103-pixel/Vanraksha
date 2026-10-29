import test from 'node:test';
import assert from 'node:assert/strict';
import { ALLOWED_STATUSES, isValidStatus, getStatusMetadata, getStatusColor } from './status';

test('ALLOWED_STATUSES contains exactly the four approved demonstrator statuses', () => {
  assert.equal(ALLOWED_STATUSES.length, 4);
  assert.ok(ALLOWED_STATUSES.includes('NORMAL MONITORING'));
  assert.ok(ALLOWED_STATUSES.includes('WATCH'));
  assert.ok(ALLOWED_STATUSES.includes('FIELD CHECK RECOMMENDED'));
  assert.ok(ALLOWED_STATUSES.includes('DATA INCOMPLETE'));
});

test('isValidStatus validates approved statuses and rejects forbidden predictive wording', () => {
  assert.equal(isValidStatus('NORMAL MONITORING'), true);
  assert.equal(isValidStatus('WATCH'), true);
  assert.equal(isValidStatus('FIELD CHECK RECOMMENDED'), true);
  assert.equal(isValidStatus('DATA INCOMPLETE'), true);

  // Strict wording checks: unapproved states must be rejected
  assert.equal(isValidStatus('FIRE ALERT'), false);
  assert.equal(isValidStatus('CRITICAL'), false);
  assert.equal(isValidStatus('DEAD FOREST'), false);
  assert.equal(isValidStatus('WARNING'), false);
  assert.equal(isValidStatus(null), false);
  assert.equal(isValidStatus(undefined), false);
});

test('getStatusMetadata provides the correct color tokens according to design system', () => {
  const normal = getStatusMetadata('NORMAL MONITORING');
  assert.equal(normal.colorHex, '#2ECC71');

  const watch = getStatusMetadata('WATCH');
  assert.equal(watch.colorHex, '#F5B841');

  const fieldCheck = getStatusMetadata('FIELD CHECK RECOMMENDED');
  assert.equal(fieldCheck.colorHex, '#E5533D');

  const incomplete = getStatusMetadata('DATA INCOMPLETE');
  assert.equal(incomplete.colorHex, '#8A9A92');
});

test('getStatusMetadata safely falls back to DATA INCOMPLETE for unknown strings', () => {
  const fallback = getStatusMetadata('UNKNOWN_CODE');
  assert.equal(fallback.label, 'DATA INCOMPLETE');
  assert.equal(fallback.colorHex, '#8A9A92');
});

test('getStatusColor returns accurate hex codes', () => {
  assert.equal(getStatusColor('NORMAL MONITORING'), '#2ECC71');
  assert.equal(getStatusColor('WATCH'), '#F5B841');
  assert.equal(getStatusColor('FIELD CHECK RECOMMENDED'), '#E5533D');
  assert.equal(getStatusColor('DATA INCOMPLETE'), '#8A9A92');
});
