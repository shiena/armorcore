
const release = process.argv.indexOf("--debug") == -1;
const with_d3dcompiler = true;
const with_nfd = true;
const with_tinydir = true;
const with_zlib = true;
const with_stb_image_write = true;
const with_audio = false;
const with_texsynth = false;
const with_onnx = false;
const with_krafix = graphics === GraphicsApi.Vulkan; // glsl to spirv for vulkan
const with_worker = false;

const system = platform === Platform.Windows ? "win32" :
			   platform === Platform.Linux   ? "linux" :
			   platform === Platform.OSX     ? "macos" :
			   platform === Platform.HTML5   ? "html5" :
			   platform === Platform.Android ? "android" :
			   platform === Platform.iOS     ? "ios" :
			   								   "unknown";

const build = release ? 'release' : 'debug';
const libdir = 'v8/libraries/' + system + '/' + build + '/';

let project = new Project('Krom');
project.cpp11 = true;
project.setDebugDir('Deployment');
project.addDefine('KINC_IMAGE_STANDARD_MALLOC');

project.targetOptions.android.package = 'org.armorpaint';
project.targetOptions.android.permissions = ['android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.READ_EXTERNAL_STORAGE'];
project.targetOptions.android.screenOrientation = ['sensorLandscape'];
project.targetOptions.android.minSdkVersion = 29;
project.targetOptions.android.targetSdkVersion = 29;

if (platform === Platform.OSX) {
	// Otherwise V8::Initialize() hangs
	project.cpp = true;
}

if (with_audio) {
	project.addDefine('WITH_AUDIO');
}

if (platform === Platform.HTML5) {
	project.addFile('Sources/main_html5.c');
	// EmscriptenExporter.js:
	// -s EXTRA_EXPORTED_RUNTIME_METHODS=["cwrap"] -s ALLOW_TABLE_GROWTH
	// -s USE_WEBGL2=1 or -s MIN_WEBGL_VERSION=2 -s MAX_WEBGL_VERSION=2
}
else {
	project.addFile('Sources/main.cpp');
	if (with_worker) {
		project.addDefine('WITH_WORKER');
		project.addFile('Sources/worker.h');
		project.addFile('Sources/worker.cpp');
	}
}

project.addIncludeDir('v8/include');

if (platform === Platform.Android) {
	project.addFile('Sources/AndroidFileDialog.cpp');
	project.addDefine('IDLE_SLEEP');
}
else if (platform === Platform.iOS) {
	project.addFile('Sources/IOSFileDialog.mm');
	project.addDefine('IDLE_SLEEP');
}

if (platform === Platform.Windows) {
	project.addLib('Dbghelp'); // Stack walk
	project.addLib(libdir + 'v8_monolith');
	// project.addDefine('V8_COMPRESS_POINTERS');
	// project.addDefine('V8_31BIT_SMIS_ON_64BIT_ARCH');
	if (with_d3dcompiler && (graphics === GraphicsApi.Direct3D11 || graphics === GraphicsApi.Direct3D12)) {
		project.addDefine('WITH_D3DCOMPILER');
		project.addLib("d3d11");
		project.addLib("d3dcompiler");
	}
	if (!release) {
		project.addDefine('_HAS_ITERATOR_DEBUGGING=0');
		project.addDefine('_ITERATOR_DEBUG_LEVEL=0');
	}
}
else if (platform === Platform.Linux) {
	project.addLib('v8_monolith -L../../' + libdir);
}
else if (platform === Platform.Android) {
	// project.addLib(libdir + 'libv8_monolith.a');

	// Some manual tweaking is required for now:
	// In app/CMakeLists.txt:
	//   add_library(v8_monolith STATIC IMPORTED)
	//   set_target_properties(v8_monolith PROPERTIES IMPORTED_LOCATION ../../../v8/libraries/android/release/libv8_monolith.a)
	//   target_link_libraries(v8_monolith)
	// In app/build.gradle:
	//   android - defaultconfig - ndk.abiFilters 'arm64-v8a'
	//   android - defaultconfig - cmake - cppFlags "-std=c++14"
	// In AndroidManifest.xml:
	//   <application android:requestLegacyExternalStorage="true"
}
else if (platform === Platform.iOS) {
	project.addLib('v8/libraries/ios/release/libv8_monolith.a');
}
else if (platform === Platform.OSX) {
	project.addLib('v8/libraries/macos/release/libv8_monolith.a');
}

if (with_nfd && (platform === Platform.Windows || platform === Platform.Linux || platform === Platform.OSX)) {
	project.addDefine('WITH_NFD');
	project.addIncludeDir("Libraries/nfd/include");
	project.addFile('Libraries/nfd/nfd_common.c');

	if (platform === Platform.Windows) {
		project.addFile('Libraries/nfd/nfd_win.cpp');
	}
	else if (platform === Platform.Linux) {
		let gtk = true;
		if (gtk) {
			project.addFile('Libraries/nfd/nfd_gtk.c');

			project.addIncludeDir("/usr/include/gtk-3.0");
			project.addIncludeDir("/usr/include/glib-2.0");
			project.addIncludeDir("/usr/lib/x86_64-linux-gnu/glib-2.0/include");
			project.addIncludeDir("/usr/include/pango-1.0");
			project.addIncludeDir("/usr/include/cairo");
			project.addIncludeDir("/usr/include/gdk-pixbuf-2.0");
			project.addIncludeDir("/usr/include/atk-1.0");
			project.addIncludeDir("/usr/lib64/glib-2.0/include");
			project.addIncludeDir("/usr/lib/glib-2.0/include");
			project.addIncludeDir("/usr/include/harfbuzz");
			project.addLib('gtk-3');
			project.addLib('gobject-2.0');
			project.addLib('glib-2.0');
		}
		else {
			project.addFile('Libraries/nfd/nfd_zenity.c');
		}
	}
	else {
		project.addFile('Libraries/nfd/nfd_cocoa.m');
	}
}
if (with_tinydir) {
	project.addDefine('WITH_TINYDIR');
	project.addIncludeDir("Libraries/tinydir/include");
}
if (with_zlib) {
	project.addDefine('WITH_ZLIB');
	project.addIncludeDir("Libraries/zlib");
	project.addFile("Libraries/zlib/*.h");
	project.addFile("Libraries/zlib/*.c");
	project.addExclude("Libraries/zlib/gzlib.c");
	project.addExclude("Libraries/zlib/gzclose.c");
	project.addExclude("Libraries/zlib/gzwrite.c");
	project.addExclude("Libraries/zlib/gzread.c");
}
if (with_stb_image_write) {
	project.addDefine('WITH_STB_IMAGE_WRITE');
	project.addIncludeDir("Libraries/stb");
}
if (with_texsynth) {
	project.addDefine('WITH_TEXSYNTH');
	project.addIncludeDir("Libraries/texsynth");
	if (platform === Platform.Windows) {
		project.addLib('Libraries/texsynth/win32/texsynth');
	}
	else if (platform === Platform.Linux) {
		project.addLib('texsynth -L../../Libraries/texsynth/linux');
	}
	else if (platform === Platform.OSX) {
		project.addLib('Libraries/texsynth/macos/libtexsynth.a');
	}
}
if (with_onnx) {
	project.addDefine('WITH_ONNX');
	project.addIncludeDir("Libraries/onnx/include");
	if (platform === Platform.Windows) {
		project.addLib('Libraries/onnx/win32/onnxruntime');
	}
	else if (platform === Platform.Linux) {
		project.addLib('onnx -L../../Libraries/onnx/linux');
	}
	else if (platform === Platform.OSX) {
		project.addLib('Libraries/onnx/macos/libonnx.dylib');
	}
}
if (with_krafix) {
	await project.addProject('Libraries/glsl_to_spirv');
}

resolve(project);
