#!/bin/bash
# Post-process Tauri-built RPM to:
# 1. Set the Vendor field
# 2. Add InitialPreference to the desktop file
# 3. Install mimeapps.list for default handler registration

set -e

BUNDLE_DIR="src-tauri/target/release/bundle/rpm"
MIMEAPPS_SOURCE="src-tauri/mimeapps.list"
VENDOR="Gess, Daddy!"

RPM_FILE=$(find "$BUNDLE_DIR" -name "*.rpm" -type f | head -1)

if [[ -z "$RPM_FILE" ]]; then
  echo "No RPM found in $BUNDLE_DIR"
  exit 1
fi

echo "=== Fixing RPM: $RPM_FILE ==="

rpmrebuild --package \
  --change-spec-preamble="sed -i '/^Group:/a Vendor: $VENDOR'" \
  --change-spec-install="cat >> \$SPEC_INSTALL_SCRIPT <<'INSTALL_EOF'

# Add InitialPreference to desktop file
DESKTOP_FILE=\$(find \$RPM_BUILD_ROOT -name 'mdv.desktop' -type f | head -1)
if [[ -n \"\$DESKTOP_FILE\" ]] && grep -q '^MimeType=' \"\$DESKTOP_FILE\" && ! grep -q '^InitialPreference=' \"\$DESKTOP_FILE\"; then
  sed -i '/^MimeType=/a InitialPreference=80' \"\$DESKTOP_FILE\"
  echo \"Added InitialPreference=80 to \$DESKTOP_FILE\"
fi

# Install mimeapps.list
APPS_DIR=\$(find \$RPM_BUILD_ROOT -type d -path '*/usr/share/applications' | head -1)
if [[ -n \"\$APPS_DIR\" ]]; then
  cp \"$PWD/$MIMEAPPS_SOURCE\" \"\$APPS_DIR/mimeapps.list\"
  echo \"Installed mimeapps.list to \$APPS_DIR\"
fi
INSTALL_EOF
" \
  --change-spec-files="echo '%attr(0644, root, root) /usr/share/applications/mimeapps.list'" \
  "$RPM_FILE"

# rpmrebuild outputs to ~/rpmbuild/RPMS/, move it back
REBUILT=$(find ~/rpmbuild/RPMS/ -name "$(basename "$RPM_FILE")" -type f | head -1)

if [[ -z "$REBUILT" ]]; then
  echo "Rebuilt RPM not found"
  exit 1
fi

mv "$REBUILT" "$RPM_FILE"
echo "=== Done: $RPM_FILE ==="
