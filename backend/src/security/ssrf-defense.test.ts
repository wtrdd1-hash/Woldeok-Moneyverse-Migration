import { describe, expect, it, vi } from 'vitest';
import { assertSafeOutboundUrl, isPrivateIp, SsrffSecurityError } from './ssrf-defense';

describe('SSRF Defense Engine', () => {
  describe('isPrivateIp', () => {
    it('identifies private IPv4 addresses accurately', () => {
      // Loopback
      expect(isPrivateIp('127.0.0.1')).toBe(true);
      expect(isPrivateIp('127.128.0.1')).toBe(true);

      // Cloud IMDS & Link-Local
      expect(isPrivateIp('169.254.169.254')).toBe(true);
      expect(isPrivateIp('169.254.1.1')).toBe(true);

      // RFC 1918 Class A (10.0.0.0/8)
      expect(isPrivateIp('10.0.0.1')).toBe(true);
      expect(isPrivateIp('10.254.254.254')).toBe(true);

      // RFC 1918 Class B (172.16.0.0/12)
      expect(isPrivateIp('172.16.0.1')).toBe(true);
      expect(isPrivateIp('172.31.255.255')).toBe(true);
      expect(isPrivateIp('172.32.0.1')).toBe(false); // Public

      // RFC 1918 Class C (192.168.0.0/16)
      expect(isPrivateIp('192.168.0.1')).toBe(true);
      expect(isPrivateIp('192.168.1.254')).toBe(true);

      // CGNAT & 0.0.0.0
      expect(isPrivateIp('0.0.0.0')).toBe(true);
      expect(isPrivateIp('100.64.0.1')).toBe(true);
      expect(isPrivateIp('255.255.255.255')).toBe(true);

      // Public IPs
      expect(isPrivateIp('8.8.8.8')).toBe(false);
      expect(isPrivateIp('1.1.1.1')).toBe(false);
      expect(isPrivateIp('142.250.190.46')).toBe(false);
    });

    it('identifies private IPv6 addresses accurately', () => {
      // Loopback
      expect(isPrivateIp('::1')).toBe(true);
      expect(isPrivateIp('::')).toBe(true);

      // Unique Local & Link-Local
      expect(isPrivateIp('fc00::1')).toBe(true);
      expect(isPrivateIp('fd12:3456:789a::1')).toBe(true);
      expect(isPrivateIp('fe80::1')).toBe(true);

      // IPv4 mapped
      expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
      expect(isPrivateIp('::ffff:169.254.169.254')).toBe(true);
      expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false);
    });
  });

  describe('assertSafeOutboundUrl', () => {
    it('blocks forbidden protocols', async () => {
      await expect(assertSafeOutboundUrl('file:///etc/passwd')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('gopher://127.0.0.1:6379/_')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('ftp://10.0.0.1/resource')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('ldap://127.0.0.1:389/')).rejects.toThrow(SsrffSecurityError);
    });

    it('blocks direct private IP destinations', async () => {
      await expect(assertSafeOutboundUrl('http://127.0.0.1:8080/admin')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('http://10.0.0.5/secrets')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('http://192.168.1.1/router')).rejects.toThrow(SsrffSecurityError);
    });

    it('blocks dangerous hostnames and internal aliases', async () => {
      await expect(assertSafeOutboundUrl('http://localhost:3000/api')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('http://service.localhost/api')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('http://metadata.google.internal/computeMetadata/v1/')).rejects.toThrow(SsrffSecurityError);
      await expect(assertSafeOutboundUrl('http://instance-data/latest/')).rejects.toThrow(SsrffSecurityError);
    });

    it('allows valid public HTTPS and HTTP URLs', async () => {
      const google = await assertSafeOutboundUrl('https://www.google.com/search?q=test');
      expect(google.hostname).toBe('www.google.com');

      const cloudflare = await assertSafeOutboundUrl('https://1.1.1.1/dns-query');
      expect(cloudflare.hostname).toBe('1.1.1.1');
    });
  });
});
