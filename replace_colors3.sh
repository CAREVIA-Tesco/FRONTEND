#!/bin/bash
find src -type f -name "*.jsx" -o -name "*.css" | xargs sed -i '' \
  -e 's/from-coral/from-secondary/g' \
  -e 's/to-coral/to-secondary/g' \
  -e 's/from-navy/from-primary/g' \
  -e 's/to-navy/to-primary/g' \
  -e 's/from-teal/from-primary/g' \
  -e 's/to-teal/to-primary/g' \
  -e 's/text-coral/text-secondary/g' \
  -e 's/bg-coral/bg-secondary/g'

echo "Done"
