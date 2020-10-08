#!/bin/bash
# @author Zachary Wartell
# @brief This script runs under Gitlab's CI/CD mechanism.  See also ../.gitlab-ci.yml

# replace the string $REVISION$ with the git log's date of last revision in the file index.html
#sed -i -e s/[$]REVISION[$]/"$(git log --format=format:\"%cD\" HEAD@{1}..HEAD)"/ .public/index.html
sed -i -e s/[$]REVISION[$]/"$(cat REVISION.txt)"/ .public/index.html
