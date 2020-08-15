# armorcore

3D engine core for C with embedded V8. ArmorCore is designed for the [Graphics5](https://github.com/Kode/Kinc/tree/master/Backends/Graphics5) api and targets Direct3D12, Vulkan, Metal and WebGPU. *(wip!)*

Based on [Krom](https://github.com/Kode/Krom). Powered by [Kinc](https://github.com/Kode/Kinc). Powering [ArmorPaint](https://github.com/armory3d/armorpaint).

```bash
git clone --recursive https://github.com/armory3d/armorcore
cd armorcore
```
```bash
# Windows
# Unpack `v8\libraries\win32\release\v8_monolith.7z` using 7-Zip - Extract Here (exceeds 100MB)
node Kinc/make -g direct3d11
# Open generated Visual Studio project
# Build for x64 & release
```
```bash
# Linux
node Kinc/make -g opengl --compiler clang --compile
cd Deployment
strip Krom
```
```bash
# macOS
node Kinc/make -g metal
# Open generated Xcode project
# Add `path/to/armorcore/v8/libraries/macos/release` into `Project - Krom - Build Settings - Search Paths - Library Search Paths`
# Build
```
```bash
# Android - wip
node Kinc/make android -g opengl
# Manual tweaking is required for now:
# https://github.com/armory3d/armorcore/blob/master/kincfile.js#L68
# Open generated Android Studio project
# Build for device
```
```bash
# iOS - wip
node Kinc/make ios -g metal
# Open generated Xcode project
# Add `path/to/armorcore/v8/libraries/ios/release` into `Project - Krom - Build Settings - Search Paths - Library Search Paths`
# Build for device
```
```bash
# Windows DXR - wip
# Unpack `v8\libraries\win32\release\v8_monolith.7z` using 7-Zip - Extract Here (exceeds 100MB)
node Kinc/make -g direct3d12 --raytrace dxr
# Open generated Visual Studio project
# Build for x64 & release
```
```bash
# Linux VKRT - wip
node Kinc/make -g vulkan --raytrace vkrt --compiler clang --compile
cd Deployment
strip Krom
```
```bash
# Windows VR - wip
# Unpack `v8\libraries\win32\release\v8_monolith.7z` using 7-Zip - Extract Here (exceeds 100MB)
node Kinc/make -g direct3d11 --vr oculus
# Open generated Visual Studio project
# Build for x64 & release
```
