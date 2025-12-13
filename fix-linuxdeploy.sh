#!/bin/bash
# Ensures the correct linuxdeploy version is used for bundling

set -e

CACHED_LINUXDEPLOY="$HOME/.cache/tauri/linuxdeploy-x86_64.AppImage"
LOCAL_LINUXDEPLOY="$HOME/bin/linuxdeploy-x86_64.AppImage"

# Check if local linuxdeploy exists
if [ ! -f "$LOCAL_LINUXDEPLOY" ]; then
    echo "Warning: $LOCAL_LINUXDEPLOY not found, using cached version"
    exit 0
fi

# Get versions
if [ -f "$CACHED_LINUXDEPLOY" ]; then
    CACHED_VERSION=$("$CACHED_LINUXDEPLOY" --version 2>&1 | grep -oP 'build \K\d+' || echo "0")
    LOCAL_VERSION=$("$LOCAL_LINUXDEPLOY" --version 2>&1 | grep -oP 'build \K\d+' || echo "0")

    echo "Cached linuxdeploy: build $CACHED_VERSION"
    echo "Local linuxdeploy:  build $LOCAL_VERSION"

    if [ "$LOCAL_VERSION" -gt "$CACHED_VERSION" ]; then
        echo "Updating cached linuxdeploy with newer version..."
        cp "$LOCAL_LINUXDEPLOY" "$CACHED_LINUXDEPLOY"
        echo "✓ Updated to build $LOCAL_VERSION"
    else
        echo "✓ Cached version is current"
    fi
else
    echo "Creating cached linuxdeploy..."
    mkdir -p "$(dirname "$CACHED_LINUXDEPLOY")"
    cp "$LOCAL_LINUXDEPLOY" "$CACHED_LINUXDEPLOY"
    echo "✓ Cached linuxdeploy created"
fi
