#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/plugins" "$work/variants"
${CC:-cc} -O1 tests/confdump.c feats/conf.c -o "$work/dump"
eval "$(sed -n '/^np_conf_normalise() (/,/^)$/p' feats/compat_run.sh)"
for body in 'type = graphics_backend
context = launch_executable' 'type = graphics_backend
choice = dxmt' 'context = invalid'; do
  printf '[NOTPROTON_TEST]\nlabel = Test\n%s\n' "$body" > "$work/plugins/test.conf"
  "$work/dump" "$work" > "$work/c"
  np_conf_normalise "$work/plugins" plugins plugin > "$work/sh"
  diff -u "$work/c" "$work/sh"
  case "$body" in
    *'context = launch_executable'*) ! grep -q '^!' "$work/c" ;;
    *) grep -q 'bad-value:' "$work/c" ;;
  esac
done
printf '[NOTPROTON_TEST]\nlabel = Test\ntype = graphics_backend\ncontext = launch_executable\n' > "$work/plugins/test.conf"
"$work/dump" "$work" > "$work/c"
if grep -q '^!' "$work/c"; then cat "$work/c"; exit 1; fi
printf 'launcher context schema checks passed\n'
