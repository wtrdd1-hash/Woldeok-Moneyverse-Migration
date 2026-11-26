#!/usr/bin/env python3
"""Staged synthetic read-load generator for an ISOLATED sandbox or Test runtime only.

Never point this at Production. It refuses non-loopback targets unless --allow-remote-test is
given, so a mistyped host cannot load the public site. Standard library only (no install).
Usage: loadgen.py --base http://127.0.0.1:56520 --stock <uuid> --stages 5,20,50,100 --seconds 60
"""
import argparse, http.client, json, random, statistics, threading, time, urllib.parse

def mix(stock):
    return [("/api/v1/stocks", 40), (f"/api/v1/stocks/{stock}/candles", 30),
            ("/api/v1/content/announcements", 10), ("/api/v1/content/photos", 10),
            ("/api/v1/stocks/league/current", 10)]

def worker(base, paths, weights, stop, out, lock):
    u = urllib.parse.urlparse(base)
    conn = http.client.HTTPConnection(u.hostname, u.port, timeout=10)
    lat, codes = [], {}
    while not stop.is_set():
        path = random.choices(paths, weights)[0]
        t = time.perf_counter()
        try:
            conn.request("GET", path, headers={"Accept": "application/json"})
            r = conn.getresponse(); r.read(); code = r.status
        except Exception:
            code = "ERR"; conn.close(); conn = http.client.HTTPConnection(u.hostname, u.port, timeout=10)
        lat.append((time.perf_counter() - t) * 1000); codes[code] = codes.get(code, 0) + 1
    with lock:
        out["lat"].extend(lat)
        for k, v in codes.items(): out["codes"][k] = out["codes"].get(k, 0) + v

def pct(xs, p):
    if not xs: return None
    xs = sorted(xs); return round(xs[min(len(xs) - 1, int(len(xs) * p))], 1)

def main():
    a = argparse.ArgumentParser()
    a.add_argument("--base", required=True); a.add_argument("--stock", required=True)
    a.add_argument("--stages", default="5,20,50,100"); a.add_argument("--seconds", type=int, default=60)
    a.add_argument("--allow-remote-test", action="store_true")
    a.add_argument("--max-error-rate", type=float, default=0.2, help="stop escalating above this")
    o = a.parse_args()
    host = urllib.parse.urlparse(o.base).hostname
    if host not in ("127.0.0.1", "localhost", "::1") and not o.allow_remote_test:
        raise SystemExit("refusing non-loopback target without --allow-remote-test")
    m = mix(o.stock); paths = [p for p, _ in m]; weights = [w for _, w in m]
    for vus in map(int, o.stages.split(",")):
        out, lock, stop = {"lat": [], "codes": {}}, threading.Lock(), threading.Event()
        ts = [threading.Thread(target=worker, args=(o.base, paths, weights, stop, out, lock)) for _ in range(vus)]
        t0 = time.time(); [t.start() for t in ts]; time.sleep(o.seconds); stop.set(); [t.join() for t in ts]
        n = len(out["lat"]); ok = sum(v for k, v in out["codes"].items() if isinstance(k, int) and k < 500)
        err = n - ok
        res = {"vus": vus, "seconds": round(time.time() - t0, 1), "requests": n, "rps": round(n / o.seconds, 1),
               "p50_ms": pct(out["lat"], .50), "p95_ms": pct(out["lat"], .95), "p99_ms": pct(out["lat"], .99),
               "max_ms": round(max(out["lat"]), 1) if n else None, "codes": {str(k): v for k, v in out["codes"].items()},
               "error_rate": round(err / n, 4) if n else None}
        print(json.dumps(res), flush=True)
        if n and err / n > o.max_error_rate:
            print(json.dumps({"stopped": f"error rate above {o.max_error_rate} at {vus} VUs"})); break

if __name__ == "__main__":
    main()
