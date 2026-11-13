#!/usr/bin/env bash
# Start the Google Flow MCP server (cloud edition) over stdio.
# Cloud edition: no local Chrome is launched. Browser work runs in the
# already-signed-in cloud browser via the disk task queue (state/cloud-queue/).
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"
exec node start-stdio.mjs
