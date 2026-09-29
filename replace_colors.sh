#!/bin/bash
find src -type f -name "*.jsx" -o -name "*.css" | xargs sed -i '' \
  -e 's/text-navy/text-primary/g' \
  -e 's/bg-navy/bg-primary/g' \
  -e 's/text-teal/text-primary/g' \
  -e 's/bg-teal/bg-primary/g' \
  -e 's/text-coral/text-secondary/g' \
  -e 's/bg-coral/bg-secondary/g' \
  -e 's/text-\[#0A2540\]/text-primary/g' \
  -e 's/bg-\[#0A2540\]/bg-primary/g' \
  -e 's/text-\[#1E3A8A\]/text-primary/g' \
  -e 's/bg-\[#1E3A8A\]/bg-primary/g' \
  -e 's/text-\[#0BAB7C\]/text-primary/g' \
  -e 's/bg-\[#0BAB7C\]/bg-primary/g' \
  -e 's/ring-\[#0BAB7C\]/ring-primary/g' \
  -e 's/text-\[#E87070\]/text-secondary/g' \
  -e 's/bg-\[#E87070\]/bg-secondary/g' \
  -e 's/hover:text-\[#1E3A8A\]/hover:text-primary/g' \
  -e 's/hover:bg-\[#ff5252\]/hover:bg-secondary-hover/g' \
  -e 's/hover:bg-\[#d65e5e\]/hover:bg-secondary-hover/g' \
  -e 's/from-\[#E87070\]/from-secondary/g' \
  -e 's/to-\[#ff8c8c\]/to-secondary-hover/g' \
  -e 's/bg-\[#008751\]/bg-primary/g' \
  -e 's/hover:bg-\[#007042\]/hover:bg-primary-hover/g' \
  -e 's/hover:text-\[#0BAB7C\]/hover:text-primary/g'

echo "Done"
