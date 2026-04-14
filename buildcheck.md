🎉 Both distros building cleanly through Docker — nice.

The AppImage being ~100 MB vs the RPM at 6.7 MB is expected: AppImage bundles the entire webkit2gtk + GTK stack so it runs on any distro, while the RPM/deb pull those from system packages.

Worth a smoke test before you ship either:

- `rpm -qlp dist/fedora43/mdv-0.1.6-1.x86_64.rpm` — confirm the `Vendor:` got rewritten and `InitialPreference=80` is in the `.desktop` file (that's what `fix-rpm.sh` does).
- `dpkg-deb -I dist/debian/mdv_0.1.6_amd64.deb` — sanity-check the `Depends:` line includes `libwebkit2gtk-4.1-0`. If it does, the deb will install cleanly on bookworm and later; if it says `4.0` instead, something's off.
- Run the AppImage once: `chmod +x dist/fedora43/mdv_0.1.6_amd64.AppImage && ./dist/fedora43/mdv_0.1.6_amd64.AppImage README.md` — confirms it opens and renders without the system webkit.

Happy it's done. Two hours of "file not found" → a three-target bundling pipeline in one session isn't bad.
