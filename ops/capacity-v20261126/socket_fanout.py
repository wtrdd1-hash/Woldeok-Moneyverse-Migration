#!/usr/bin/env python3
"""Socket.IO (Engine.IO v4, websocket) fan-out probe for an ISOLATED sandbox/Test only.

Opens N anonymous connections, subscribes each to the public `market` room, counts
`market:ticks` events per client for a fixed window, then reconnects a fraction and checks they
receive ticks again. Loopback only unless --allow-remote-test. Standard library only.
"""
import argparse, base64, json, os, socket, statistics, struct, threading, time, urllib.parse

def ws_connect(host, port, path, timeout=10):
    s = socket.create_connection((host, port), timeout=timeout)
    key = base64.b64encode(os.urandom(16)).decode()
    s.sendall((f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
               f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\nOrigin: http://{host}:{port}\r\n\r\n").encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        chunk = s.recv(4096)
        if not chunk: raise ConnectionError("closed during handshake")
        buf += chunk
    head, rest = buf.split(b"\r\n\r\n", 1)
    if b" 101 " not in head.split(b"\r\n")[0]: raise ConnectionError(head.split(b"\r\n")[0].decode())
    return s, rest

def send_text(s, text):
    data = text.encode(); mask = os.urandom(4); n = len(data)
    hdr = bytes([0x81]) + (bytes([0x80 | n]) if n < 126 else bytes([0x80 | 126]) + struct.pack(">H", n))
    s.sendall(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

def frames(s, buf):
    while True:
        while len(buf) < 2:
            c = s.recv(65536)
            if not c: return
            buf += c
        b1 = buf[1] & 0x7F; off = 2
        if b1 == 126:
            while len(buf) < 4: buf += s.recv(65536)
            b1 = struct.unpack(">H", buf[2:4])[0]; off = 4
        elif b1 == 127:
            while len(buf) < 10: buf += s.recv(65536)
            b1 = struct.unpack(">Q", buf[2:10])[0]; off = 10
        while len(buf) < off + b1:
            c = s.recv(65536)
            if not c: return
            buf += c
        op = buf[0] & 0x0F; payload = buf[off:off + b1]; buf = buf[off + b1:]
        yield op, payload

class Client(threading.Thread):
    def __init__(s, host, port, stop):
        super().__init__(daemon=True); s.host, s.port, s.stop = host, port, stop
        s.ticks = 0; s.quotes = 0; s.bytes = 0; s.error = None; s.subscribed_at = None; s.sock = None
    def run(s):
        try:
            sock, rest = ws_connect(s.host, s.port, "/socket.io/?EIO=4&transport=websocket")
            # A timeout inside the frame generator would end it; ticks arrive every 2 s, so wait
            # long and let the coordinator close the socket when the window ends.
            sock.settimeout(30); s.sock = sock
            for op, p in frames(sock, rest):
                t = p.decode("utf-8", "replace")
                if t.startswith("0{"):
                    # netty-socketio joins the default namespace itself; a client "40" closes it.
                    send_text(sock, '42["market:subscribe"]'); s.subscribed_at = time.time()
                elif t == "2": send_text(sock, "3")
                elif t.startswith('42["market:ticks"'): s.ticks += 1; s.bytes += len(p)
                elif t.startswith('42["market:quote-update"'): s.quotes += 1; s.bytes += len(p)
            if not s.stop.is_set(): s.error = "closed"
        except Exception as e:
            if not s.stop.is_set(): s.error = type(e).__name__ + ":" + str(e)[:80]

def run(host, port, n, seconds):
    stop = threading.Event(); cs = [Client(host, port, stop) for _ in range(n)]
    t0 = time.time()
    for c in cs: c.start(); time.sleep(0.002)
    time.sleep(seconds); stop.set()
    for c in cs:
        try: c.sock and c.sock.close()
        except Exception: pass
    [c.join(3) for c in cs]
    ok = [c for c in cs if c.error is None and c.subscribed_at]
    ticks = [c.ticks for c in ok]
    return {"connections": n, "subscribed": len(ok), "errors": sum(1 for c in cs if c.error),
            "error_sample": next((c.error for c in cs if c.error), None), "window_s": seconds,
            "ticks_per_client_median": statistics.median(ticks) if ticks else 0,
            "ticks_per_client_min": min(ticks) if ticks else 0,
            "expected_ticks_at_2s": seconds // 2,
            "quote_updates_per_client_median": statistics.median([c.quotes for c in ok]) if ok else 0,
            "kib_per_client_per_min": round(statistics.mean([c.bytes for c in ok]) / 1024 * 60 / seconds, 1) if ok else 0}

def main():
    a = argparse.ArgumentParser(); a.add_argument("--host", default="127.0.0.1"); a.add_argument("--port", type=int, required=True)
    a.add_argument("--stages", default="50,200,500"); a.add_argument("--seconds", type=int, default=30)
    a.add_argument("--allow-remote-test", action="store_true"); o = a.parse_args()
    if o.host not in ("127.0.0.1", "localhost", "::1") and not o.allow_remote_test: raise SystemExit("refusing non-loopback target")
    for n in map(int, o.stages.split(",")):
        print(json.dumps(run(o.host, o.port, n, o.seconds)), flush=True)
    print(json.dumps({"reconnect": run(o.host, o.port, max(10, int(o.stages.split(",")[0]) // 5), 10)}), flush=True)

if __name__ == "__main__":
    main()
