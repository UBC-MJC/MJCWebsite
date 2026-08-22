#!/bin/bash

# Load the Node version pinned by the repository, including in non-interactive
# shells where NVM is not initialized automatically.
MJC_PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MJC_REQUIRED_NODE_VERSION="$(tr -d '[:space:]' < "$MJC_PROJECT_ROOT/.nvmrc")"
MJC_NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ -s "$MJC_NVM_DIR/nvm.sh" ]; then
    export NVM_DIR="$MJC_NVM_DIR"
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use --silent "$MJC_REQUIRED_NODE_VERSION"
fi

if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node $MJC_REQUIRED_NODE_VERSION is required but Node is not installed." >&2
    exit 1
fi

MJC_ACTIVE_NODE_VERSION="$(node --version)"
if [ "$MJC_ACTIVE_NODE_VERSION" != "v$MJC_REQUIRED_NODE_VERSION" ]; then
    echo "Error: Node $MJC_REQUIRED_NODE_VERSION is required, but $MJC_ACTIVE_NODE_VERSION is active." >&2
    echo "Install it with NVM or run: nvm use" >&2
    exit 1
fi
