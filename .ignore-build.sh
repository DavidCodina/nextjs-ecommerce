#!/bin/sh
if [ "$VERCEL_GIT_PULL_REQUEST" == "false" ] && [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "Skipping build for non-PR and non-main branch"
  exit 1
fi

echo "Proceeding with deployment"
exit 0