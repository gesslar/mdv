#!/usr/bin/env bash

$ELEVATOR && elevate

VERSION=$(jq -r ".version" package.json)
NAME=$(jq -r ".name" package.json)
FILENAME="$(pwd)/src-tauri/target/release/bundle/rpm/$NAME-$VERSION-1.$(arch).rpm"

cd /projects/repos/rpm/ && bash publish "$FILENAME"

sudo dnf makecache --refresh
dnf repoquery --disablerepo="*" --enablerepo="yes-daddy"
