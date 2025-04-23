#!/bin/sh
if [ -n "$VERCEL_GIT_PULL_REQUEST" ] || [ "$VERCEL_GIT_COMMIT_REF" == "main" ]; then
  echo "Proceeding with deployment"
  exit 0
else
  echo "Skipping build for non-PR and non-main branch"
  exit 1
fi
