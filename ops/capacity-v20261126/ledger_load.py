#!/usr/bin/env python3
"""Synthetic member transfer load and same-idempotency-key race, ISOLATED sandbox/Test only.

Signs in synthetic members through the real local sign-in API, then drives
POST /api/v1/wallet/transfers (session + CSRF + idempotency key). Loopback only unless
--allow-remote-test. Standard library only. Credentials come from a file, never argv/log.
"""
import argparse, concurrent.futures, http.client, json, random, threading, time, urllib.parse, uuid

def pct(xs, p):
    xs = sorted(xs); return round(xs[min(len(xs) - 1, int(len(xs) * p))], 1) if xs else None

class Member:
    def __init__(s, cookie, csrf, uid): s.cookie, s.csrf, s.uid = cookie, csrf, uid

def sign_in(host, port, email, password):
    c = http.client.HTTPConnection(host, port, timeout=30)
    c.request("POST", "/api/v1/auth/local/login", json.dumps({"email": email, "password": password}),
              {"Content-Type": "application/json"})
    r = c.getresponse(); body = json.loads(r.read() or b"{}")
    if r.status != 200: raise RuntimeError(f"sign-in {email}: {r.status}")
    cookies = [h.split(";")[0] for k, h in r.getheaders() if k.lower() == "set-cookie"]
    return Member("; ".join(cookies), body["csrfToken"], body["userId"])

def transfer(conn, m, to, amount, key):
    body = json.dumps({"recipientUserId": to, "amount": str(amount), "idempotencyKey": key})
    t = time.perf_counter()
    try:
        conn.request("POST", "/api/v1/wallet/transfers", body, {"Content-Type": "application/json",
                     "Cookie": m.cookie, "X-CSRF-Token": m.csrf, "Accept": "application/json"})
        r = conn.getresponse(); data = r.read(); code = r.status
    except Exception:
        return None, "ERR", (time.perf_counter() - t) * 1000
    return data, code, (time.perf_counter() - t) * 1000

def stage(host, port, members, vus, seconds):
    stop = threading.Event(); lat, codes, lock = [], {}, threading.Lock()
    def w():
        c = http.client.HTTPConnection(host, port, timeout=15); l, cd = [], {}
        while not stop.is_set():
            a, b = random.sample(members, 2)
            _, code, ms = transfer(c, a, b.uid, random.randint(1, 50), str(uuid.uuid4()))
            if code == "ERR": c = http.client.HTTPConnection(host, port, timeout=15)
            l.append(ms); cd[code] = cd.get(code, 0) + 1
        with lock:
            lat.extend(l)
            for k, v in cd.items(): codes[k] = codes.get(k, 0) + v
    ts = [threading.Thread(target=w) for _ in range(vus)]; [t.start() for t in ts]
    time.sleep(seconds); stop.set(); [t.join() for t in ts]
    n = len(lat); e5 = sum(v for k, v in codes.items() if k == "ERR" or (isinstance(k, int) and k >= 500))
    return {"scenario": "transfers", "vus": vus, "requests": n, "rps": round(n / seconds, 1), "p50_ms": pct(lat, .5),
            "p95_ms": pct(lat, .95), "p99_ms": pct(lat, .99), "codes": {str(k): v for k, v in codes.items()},
            "error_5xx_rate": round(e5 / n, 4) if n else None}

def same_key_race(host, port, members, racers):
    a, b = members[0], members[1]; key = str(uuid.uuid4()); barrier = threading.Barrier(racers)
    def one(_):
        c = http.client.HTTPConnection(host, port, timeout=30); barrier.wait()
        data, code, ms = transfer(c, a, b.uid, 7, key)
        try: tx = json.loads(data).get("data", {}).get("transactionId")
        except Exception: tx = None
        return code, tx
    with concurrent.futures.ThreadPoolExecutor(racers) as ex: res = list(ex.map(one, range(racers)))
    codes = {}; txs = set()
    for code, tx in res:
        codes[str(code)] = codes.get(str(code), 0) + 1
        if tx: txs.add(tx)
    return {"scenario": "same_key_race", "racers": racers, "key": key, "codes": codes, "distinct_transaction_ids": len(txs)}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--base", required=True); p.add_argument("--password-file", required=True)
    p.add_argument("--members", type=int, default=50); p.add_argument("--stages", default="5,20,50")
    p.add_argument("--seconds", type=int, default=60); p.add_argument("--race", type=int, default=20)
    p.add_argument("--allow-remote-test", action="store_true")
    o = p.parse_args(); u = urllib.parse.urlparse(o.base)
    if u.hostname not in ("127.0.0.1", "localhost", "::1") and not o.allow_remote_test:
        raise SystemExit("refusing non-loopback target")
    pw = open(o.password_file).read().strip()
    t = time.time()
    members = [sign_in(u.hostname, u.port, f"synthetic-{i:04d}@sandbox.invalid", pw) for i in range(1, o.members + 1)]
    print(json.dumps({"signed_in": len(members), "seconds": round(time.time() - t, 1)}), flush=True)
    print(json.dumps(same_key_race(u.hostname, u.port, members, o.race)), flush=True)
    for v in map(int, o.stages.split(",")):
        print(json.dumps(stage(u.hostname, u.port, members, v, o.seconds)), flush=True)
    print(json.dumps(same_key_race(u.hostname, u.port, members, o.race)), flush=True)

if __name__ == "__main__":
    main()
