#!/usr/bin/env python3
"""Read-only smoke for the isolated Test virtual host; never exercises financial writes."""
import argparse
import http.client
import json
import xml.etree.ElementTree as ET


def get(method, path):
    connection = http.client.HTTPConnection("127.0.0.1", 80, timeout=6)
    try:
        connection.request(method, path, headers={"Host": "test.easy-scraping.com"})
        response = connection.getresponse()
        body = response.read()
        return response.status, dict((k.lower(), v) for k, v in response.getheaders()), body
    finally:
        connection.close()


def assert_eq(actual, expected, message):
    if actual != expected:
        raise AssertionError(f"{message}: actual={actual!r}, expected={expected!r}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected-source-sha", required=True)
    args = parser.parse_args()
    checks = 0
    for method in ("GET", "HEAD", "POST"):
        for path in ("/robots.txt", "/sitemap.xml"):
            status, headers, body = get(method, path)
            assert_eq(status, 405 if method == "POST" else 200, f"{method} {path}")
            if method != "POST":
                assert "noindex" in headers.get("x-robots-tag", "")
                assert "no-store" in headers.get("cache-control", "")
            if method == "GET" and path == "/robots.txt":
                assert_eq(body, b"User-agent: *\nDisallow: /\n", "robots bytes")
                assert headers["content-type"].startswith("text/plain")
            if method == "GET" and path == "/sitemap.xml":
                root = ET.fromstring(body)
                assert root.tag.endswith("urlset")
                assert not list(root), "Test sitemap must have no member or Production URLs"
                assert headers["content-type"] in ("text/xml", "application/xml")
            checks += 1
    for path, expected in (("/", 200), ("/login", 200), ("/terms", 200), ("/privacy", 200), ("/admin", 302), ("/api/v1/stocks", 200)):
        status, _, _ = get("GET", path)
        assert_eq(status, expected, f"Test origin {path}")
        checks += 1
    status, _, body = get("GET", "/frontend-version")
    assert_eq(status, 200, "Test source identity status")
    assert_eq(json.loads(body)["id"], args.expected_source_sha, "Test source identity")
    checks += 1
    print(f"PASS {checks}/{checks} isolated Test HTTP requests; restricted /admin stays redirect-only.")
    status, _, _ = get("GET", "/__qa_semantic_not_found_v20261118_16")
    print(f"OPEN: non-existent path returns HTTP {status}, expected 404 (no auth relaxation).")


if __name__ == "__main__":
    main()
