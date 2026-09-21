# mini-redis

A **learning prototype** of Redis: a TCP in-memory key-value server that shows how the core pieces fit together.

It is not a Redis clone and not Redis-compatible. The protocol is a simple `::` text format, not RESP, so `redis-cli` and official clients will not work.

## What this prototype covers

| Redis idea | In this project |
|---|---|
| TCP server | Node `net` server on port `3000` |
| Line-based protocol | `COMMAND::key::value::ttl` + incoming buffer |
| In-memory store | Process-local `Map` |
| Core commands | `PING`, `SET`, `GET`, `DEL` |
| TTL | Optional time on `SET` (`5s`, `2m`, `1h`, `1d`) |
| Lazy expiry | Key is deleted only when `GET` finds it expired |
| Max memory + LRU | Evict least-recently-used keys when `max_memory` is full |

Restarting the process clears all data. Nothing is written to disk.

## Run

```bash
npm install
npm run dev
```

Connect with netcat:

```bash
nc localhost 3000
```

Default config (`src/config.js`): port `3000`, `max_memory` `1024` bytes (small on purpose, so LRU is easy to test).

## Protocol

One command per line:

```text
COMMAND::key::value::ttl
```

| Command | Format | Response |
|---|---|---|
| `PING` | `PING` | `PONG` |
| `SET` | `SET::name::rohit` | `OK` |
| `SET` + TTL | `SET::name::rohit::5s` | `OK` |
| `GET` | `GET::name` | stored value, `Key not found`, or `Key expired` |
| `DEL` | `DEL::name` | `Key deleted` |

TTL units: `S` (seconds), `M` (minutes), `H` (hours), `D` (days).

```text
set::name::rohit::5s
OK
get::name
rohit
# wait 5 seconds
get::name
Key expired
```

If a new `SET` cannot fit even after evicting LRU keys, the server returns `Memory limit exceeded`.

## How it works

```text
TCP client
    → tcpServer (port 3000)
    → connector (buffer until `\n`)
    → parser (COMMAND::key::value::ttl)
    → storage (Map + TTL + LRU)
    → response
```

- **Storage** — each key is `{ value, expirationTime }`.
- **Lazy TTL** — no background timer. On `GET`, an expired key is removed and the client gets `Key expired`.
- **LRU** — `Map` insertion order tracks recency. `GET` / overwrite moves a key to the end. When memory is full, the oldest key is evicted first.

`DEL` does not check expiry. Expired keys that are never read stay in memory until a `GET`, an LRU eviction, or process exit.

## Project layout

```text
index.js
src/
  config.js                port and max_memory
  enums.js                 commands and time units
  server/tcpServer.js      TCP listen + connections
  server/connector.js      per-socket buffer and request/response
  protocol/parser.js       split and validate commands
  storage/storage.js       SET / GET / DEL / PING + LRU evict
  ttl/expirationTime.js    TTL calculate + validate
  LRU/memoryCalculation.js entry size and memory counter
```

## Out of scope

This prototype does not include:

- RESP / `redis-cli` compatibility
- Active (background) expiry
- Persistence (RDB / AOF)
- Lists, hashes, sets, pub/sub, transactions
