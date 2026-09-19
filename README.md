# mini-redis

A small in-memory key-value server inspired by Redis. It listens over TCP and supports `PING`, `SET`, `GET`, and `DEL`, plus optional TTL with lazy expiry.

This is a learning prototype, not Redis-compatible. It uses a custom `::` text protocol, not RESP, so `redis-cli` will not work.

## Run

```bash
npm install
npm run dev
```

Server listens on `localhost:3000`. Connect with netcat:

```bash
nc localhost 3000
```

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

## How it works

```text
TCP client
    → tcpServer (port 3000)
    → connector (socket)
    → parser (COMMAND::key::value::ttl)
    → storage (in-memory Map)
    → response
```

- **Storage** — keys live in a process-local `Map`. Restarting the server clears everything.
- **TTL** — `SET` with a time suffix stores `expirationTime = now + ttl`.
- **Lazy expiry** — nothing is deleted on a timer. On `GET`, if the key is past `expirationTime`, it is removed and the client gets `Key expired`.

`DEL` does not check expiry. Expired keys that are never read stay in memory until the process exits.

## Project layout

```text
index.js
src/
  server/tcpServer.js      TCP listen + connections
  server/connector.js      per-socket request/response
  protocol/parser.js       split and validate commands
  storage/storage.js       SET / GET / DEL / PING
  ttl/expirationTime.js    TTL calculate + validate
  enums.js                 commands and time units
```

## Not implemented yet

- RESP / `redis-cli` compatibility
- Active (background) expiry
- Persistence (RDB / AOF)
- Lists, hashes, sets
- Memory limits / eviction
