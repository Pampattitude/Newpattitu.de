#!/bin/bash

PWD="$(dirname $0)"
DIRFILES="$(ls $PWD/scss/*.scss)"

mkdir -p "$PWD/css"

for FILE in $DIRFILES; do
    NEWFILE="$PWD/css/$(basename $FILE .scss).css"
    echo "Generating \"$(basename \"$NEWFILE\") from $(basename \"$FILE\")..."
    scss "$FILE" "$NEWFILE"
    echo "\"$(basename \"$NEWFILE\") generated"
done

echo "Cleaning .map files in \"$PWD/css/\" folder..."
rm -vf "$PWD/css/"*.map
echo ".map files in \"$PWD/css/\" folder cleaned"
