#!/bin/bash
find src -type f -name "*.jsx" -o -name "*.css" | xargs sed -i '' \
  -e 's/to-\[#ff5252\]/to-secondary-hover/g' \
  -e 's/border-\[#1E3A8A\]/border-primary/g' \
  -e 's/border-\[#E87070\]/border-secondary/g' \
  -e 's/to-\[#1E3A8A\]/to-primary/g'

echo "Done"
