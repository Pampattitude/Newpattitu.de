#!/bin/bash

FILES=`find . -name "*.js" | grep -v node_modules | sort`

DIM="\\e[2m"
RESET="\\e[0m"

for FILE in $FILES; do
    echo -e -n "$DIM"
    echo -n "Validating $FILE..."
    echo -e "$RESET"
    esvalidate "$FILE" | sed -e "s/^/  /g"
done
