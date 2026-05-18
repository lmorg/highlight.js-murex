#!/usr/bin/env bash
set -euo pipefail

name="world"
if [[ -n "${name}" ]]; then
  echo "hello ${name}" | sed 's/world/earth/'
fi

for i in 1 2 3; do
  printf '%s\n' "$i"
done
