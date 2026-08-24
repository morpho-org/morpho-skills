#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
plugin_root="$repo_root/plugins/morpho-builder"

for skill in earn-integration borrow-integration; do
  target="$plugin_root/skills/$skill/references"
  mkdir -p "$target"
  cp "$plugin_root/docs/foundations.md" "$target/foundations.md"
  cp "$plugin_root/docs/glossary.md" "$target/glossary.md"
  cp "$plugin_root/docs/rubrics.md" "$target/rubrics.md"
done
