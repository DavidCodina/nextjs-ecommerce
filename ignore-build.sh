#!/bin/sh
if [ "$VERCEL_GIT_COMMIT_REF" == "main" ] || [ "$VERCEL_GIT_COMMIT_REF" == "staging" ]; then
  echo "Proceeding with deployment for main or staging"
  echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
  exit 0
else
  echo "Skipping build for branch: $VERCEL_GIT_COMMIT_REF"
  exit 1
fi