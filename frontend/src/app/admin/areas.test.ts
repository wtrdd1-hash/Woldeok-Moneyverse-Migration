import { describe, expect, it } from 'vitest';
import { adminAreaFor, consoleReturnPath } from './areas';

describe('consoleReturnPath', () => {
  it('accepts a page under the console', () => {
    expect(consoleReturnPath('/admin/economy')).toBe('/admin/economy');
    expect(consoleReturnPath('/admin/users/39fd17cf-8325-427d-a0c9-39688fa0a748')).toBe(
      '/admin/users/39fd17cf-8325-427d-a0c9-39688fa0a748',
    );
  });

  it('refuses the front door, because that is where the gate already is', () => {
    expect(consoleReturnPath('/admin')).toBeNull();
    expect(consoleReturnPath('/admin/')).toBeNull();
  });

  it('refuses anything that could lead off the console', () => {
    expect(consoleReturnPath('/wallet')).toBeNull();
    expect(consoleReturnPath('//evil.example/admin/x')).toBeNull();
    expect(consoleReturnPath('https://evil.example/admin/x')).toBeNull();
    expect(consoleReturnPath('/admin/economy?x=1')).toBeNull();
    expect(consoleReturnPath('/admin/economy#frag')).toBeNull();
    expect(consoleReturnPath('/admin/../wallet')).toBeNull();
    expect(consoleReturnPath(['/admin/economy'])).toBeNull();
    expect(consoleReturnPath(undefined)).toBeNull();
  });
});

describe('adminAreaFor', () => {
  it('names the area a nested path belongs to, by longest prefix', () => {
    expect(adminAreaFor('/admin/logs/delivery')?.href).toBe('/admin/logs/delivery');
    expect(adminAreaFor('/admin/logs/x')?.href).toBe('/admin/logs');
    expect(adminAreaFor('/admin/users/abc')?.href).toBe('/admin/users');
  });

  it('answers null for the front door and for a page without an area', () => {
    expect(adminAreaFor('/admin')).toBeNull();
    expect(adminAreaFor('/admin/shop')).toBeNull();
  });
});
