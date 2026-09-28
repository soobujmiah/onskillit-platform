#!/bin/sh
set -e

if [ "$PROCESS_ROLE" = "worker" ]; then
  exec ./node_modules/.bin/tsx src/worker/index.ts
fi

exec node server.js
