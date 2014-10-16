#!/bin/bash

PWD="$(dirname $0)"
DIRFILES="$(ls $PWD/scss/*.scss | grep -v 'scss/_')"

mkdir -p "$PWD/css"

for FILE in $DIRFILES; do
    NEWFILE="$PWD/css/$(basename $FILE .scss).css"
    echo "Generating \"$(basename \"$NEWFILE\") from $(basename \"$FILE\")..."
    rm -f "$NEWFILE" 2>&1 > /dev/null
    scss -C --sourcemap=none --style compressed --stop-on-error "$FILE" "$NEWFILE"
    echo "\"$(basename \"$NEWFILE\") generated"
done
