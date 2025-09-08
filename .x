#!/usr/bin/env bash
VERSION=1.0.0
FILES=$(find .xenv -name "*.x")
for FILE in $FILES; do
    echo $FILE
    source $FILE
done