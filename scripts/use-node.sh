#!/bin/bash

# Ensure a compatible Node version is active, including in non-interactive
# shells where NVM is not initialized automatically.
MJC_PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MJC_NODE_RELEASE="$(tr -d '[:space:]' < "$MJC_PROJECT_ROOT/.nvmrc")"
MJC_MINIMUM_NODE_VERSION="24.0.0"
MJC_NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

node_version_is_supported() {
    local active_version="${1#v}"
    local lowest_version
    lowest_version="$(printf '%s\n%s\n' "$MJC_MINIMUM_NODE_VERSION" "$active_version" | sort -V | head -n 1)"
    [ "$lowest_version" = "$MJC_MINIMUM_NODE_VERSION" ]
}

if ! command -v node >/dev/null 2>&1 || ! node_version_is_supported "$(node --version)"; then
    if [ ! -s "$MJC_NVM_DIR/nvm.sh" ]; then
        echo "Error: Node $MJC_MINIMUM_NODE_VERSION or newer is required." >&2
        exit 1
    fi

    export NVM_DIR="$MJC_NVM_DIR"
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use --silent "$MJC_NODE_RELEASE"
fi

if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node $MJC_MINIMUM_NODE_VERSION or newer is required but Node is not installed." >&2
    exit 1
fi

MJC_ACTIVE_NODE_VERSION="$(node --version)"
if ! node_version_is_supported "$MJC_ACTIVE_NODE_VERSION"; then
    echo "Error: Node $MJC_MINIMUM_NODE_VERSION or newer is required, but $MJC_ACTIVE_NODE_VERSION is active." >&2
    echo "Install a compatible release with NVM or run: nvm use" >&2
    exit 1
fi
