import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getConsentTemplate } from '../src/cookie-consent.template';
import type { ConsentCategory } from '../src/cookie-consent.component';

// Category text comes from the consent API, which an admin (or anyone holding a leaked admin key) can write.
// The template must render it as text, never as markup, because it runs in the embedding site's origin.
const hostile = '<img src=x onerror=alert(1)>';

function category(overrides: Partial<ConsentCategory>): ConsentCategory {
    return { id: 'analytics', name: 'Analytics', description: 'Stats', required: false, enabled: false, ...overrides };
}

test('category name is escaped', () => {
    const html = getConsentTemplate([category({ name: hostile })], 'desc');
    assert.ok(!html.includes('<img'), html);
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('category description is escaped', () => {
    const html = getConsentTemplate([category({ description: hostile })], 'desc');
    assert.ok(!html.includes('<img'), html);
});

test('global description is escaped', () => {
    const html = getConsentTemplate([category({})], hostile);
    assert.ok(!html.includes('<img'), html);
});

test('category id cannot break out of its attributes', () => {
    const html = getConsentTemplate([category({ id: 'x" onfocus="alert(1)' })], 'desc');
    assert.ok(!html.includes('" onfocus="'), html);
    assert.ok(html.includes('id="toggle-x&quot; onfocus=&quot;alert(1)"'));
    assert.ok(html.includes('data-category="x&quot; onfocus=&quot;alert(1)"'));
});

test('plain values render unchanged', () => {
    const html = getConsentTemplate([category({ id: 'marketing', name: 'Marketing & Ads' })], "We use cookies");
    assert.ok(html.includes('id="toggle-marketing"'));
    assert.ok(html.includes('Marketing &amp; Ads'));
    assert.ok(html.includes('We use cookies'));
});
