#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  readonly husky_skip_init=1
  export husky_skip_init

  command -v sh >/dev/null 2>&1 || {
    echo "Husky requires sh" >&2
    exit 1
  }

  sh -e "$0" "$@"
  exit $?
fi
