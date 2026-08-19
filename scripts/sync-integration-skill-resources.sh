#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
plugin_root="$repo_root/plugins/morpho-integration"

for skill in earn-integration borrow-integration earn-integration-review borrow-integration-review; do
  target="$plugin_root/skills/$skill/references"
  mkdir -p "$target"
  cp "$plugin_root/docs/foundations.md" "$target/foundations.md"
  cp "$plugin_root/docs/glossary.md" "$target/glossary.md"
  cp "$plugin_root/docs/rubrics.md" "$target/rubrics.md"
done

compliance_checkers="
attribution-compliance.md
clarity-safety-compliance.md
conversion-compliance.md
disclosure-compliance.md
discoverability-compliance.md
rate-transparency-compliance.md
vocabulary-compliance.md
"

for skill in earn-integration-review borrow-integration-review; do
  target="$plugin_root/skills/$skill/references/checkers"
  mkdir -p "$target"
  for checker in $compliance_checkers; do
    cp "$plugin_root/agents/$checker" "$target/$checker"
  done
done

for skill in earn-integration borrow-integration; do
  target="$plugin_root/skills/$skill/references/checkers"
  mkdir -p "$target"
  cp "$plugin_root/agents/math-correctness.md" "$target/math-correctness.md"
done
