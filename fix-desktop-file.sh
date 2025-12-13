#!/bin/bash
# Post-process Tauri bundles to add InitialPreference to desktop files
# and install mimeapps.list to set MDV as the default Markdown handler

set -e

BUNDLE_DIR="src-tauri/target/release/bundle"
MIMEAPPS_SOURCE="src-tauri/mimeapps.list"

echo "=== Fixing desktop files and adding mimeapps.list ==="

# 1. Add InitialPreference to desktop files
echo ""
echo "Step 1: Adding InitialPreference to desktop files..."
find "$BUNDLE_DIR" -name "mdv.desktop" -type f | while read -r desktop_file; do
    echo "Processing: $desktop_file"

    # Add InitialPreference if MimeType exists and InitialPreference doesn't
    if grep -q "^MimeType=" "$desktop_file" && ! grep -q "^InitialPreference=" "$desktop_file"; then
        # Add InitialPreference=80 right after MimeType line
        sed -i '/^MimeType=/a InitialPreference=80' "$desktop_file"
        echo "  ✓ Added InitialPreference=80"
    else
        echo "  - Skipped (already has InitialPreference or no MimeType)"
    fi
done

# 2. Install mimeapps.list into bundle structures
echo ""
echo "Step 2: Installing mimeapps.list to bundles..."

# For DEB packages
if [ -d "$BUNDLE_DIR/deb" ]; then
    find "$BUNDLE_DIR/deb" -type d -path "*/usr/share/applications" | while read -r app_dir; do
        echo "Installing to DEB: $app_dir/mimeapps.list"
        cp "$MIMEAPPS_SOURCE" "$app_dir/mimeapps.list"
        echo "  ✓ Installed"
    done
fi

# For RPM packages
if [ -d "$BUNDLE_DIR/rpm" ]; then
    find "$BUNDLE_DIR/rpm" -type d -path "*/usr/share/applications" | while read -r app_dir; do
        echo "Installing to RPM: $app_dir/mimeapps.list"
        cp "$MIMEAPPS_SOURCE" "$app_dir/mimeapps.list"
        echo "  ✓ Installed"
    done
fi

# For AppImage
if [ -d "$BUNDLE_DIR/appimage" ]; then
    find "$BUNDLE_DIR/appimage" -type d -path "*/usr/share/applications" | while read -r app_dir; do
        echo "Installing to AppImage: $app_dir/mimeapps.list"
        cp "$MIMEAPPS_SOURCE" "$app_dir/mimeapps.list"
        echo "  ✓ Installed"
    done
fi

echo ""
echo "=== Done! ==="
