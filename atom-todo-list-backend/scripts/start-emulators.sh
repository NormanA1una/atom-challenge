#!/usr/bin/env bash
# Firebase emulators (Firestore + Functions) require JDK 21+.
# On macOS, default `java` is often JDK 17; this script picks 21+ via java_home.

set -euo pipefail

# firebase.json lives at monorepo root (Atom/), not inside atom-todo-list-backend.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" == "Darwin" ]] && [[ -x /usr/libexec/java_home ]]; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 21+ 2>/dev/null || true)"
  if [[ -z "${JAVA_HOME}" ]]; then
    echo "No JDK 21+ found. Install one (e.g. brew install --cask temurin@21)." >&2
    exit 1
  fi
  export PATH="${JAVA_HOME}/bin:${PATH}"
fi
# Linux/WSL: export JAVA_HOME to a JDK 21+ install before running this script.

exec firebase emulators:start --only functions,firestore "$@"
