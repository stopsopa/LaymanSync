# 
# /bin/bash electron/download-bins.sh ${{ matrix.bins_os }} ${{ matrix.arch }}
#   where bin_os can be [OS_ARG]: darwin, win32
#   where arch can be [ARCH_ARG]: x64, arm64
#
# /bin/bash electron/download-bins.sh darwin arm64
# /bin/bash electron/download-bins.sh win32 x64
# /bin/bash electron/download-bins.sh win32 arm64
# /bin/bash electron/download-bins.sh darwin x64
# 
# /bin/bash electron/download-bins.sh
#   autodetection OS and architecture
# 

# fixed version - this is where you can do update
VERSION="1.73.0"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e

# Move to the directory where the script is located to ensure paths are relative to electron/
cd "${DIR}"

# Check dependencies
if ! command -v curl &> /dev/null; then
    echo "${0} error: curl is not installed. Please install curl to download binaries."
    exit 1
fi

if ! command -v unzip &> /dev/null; then
    echo "${0} error: unzip is not installed. Please install unzip to extract binaries."
    exit 1
fi

OS_ARG="${1}"
# Detect OS if not provided
if [ -z "${OS_ARG}" ]; then
    DETECTED_OS="$(uname -s)"
    if [ "${DETECTED_OS}" = "Darwin" ]; then
        OS_ARG="darwin"
    elif [[ "${DETECTED_OS}" == MINGW* ]] || [[ "${DETECTED_OS}" == MSYS* ]] || [[ "${DETECTED_OS}" == CYGWIN* ]]; then
        OS_ARG="win32"
    fi
    if [ -n "${OS_ARG}" ]; then
        echo "🔍 Detected OS: OS_ARG=>${OS_ARG}< (from uname -s => ${DETECTED_OS})"
    fi
fi

ARCH_ARG="${2}"
# Detect ARCH if not provided
if [ -z "${ARCH_ARG}" ]; then
    DETECTED_ARCH="$(uname -m)"
    if [ "${DETECTED_ARCH}" = "x86_64" ]; then
        ARCH_ARG="x64"
    elif [ "${DETECTED_ARCH}" = "arm64" ] || [ "${DETECTED_ARCH}" = "aarch64" ]; then
        ARCH_ARG="arm64"
    fi
    if [ -n "${ARCH_ARG}" ]; then
        echo "🔍 Detected Arch: ARCH_ARG=>${ARCH_ARG}< (from uname -m => ${DETECTED_ARCH})"
    fi
fi

# Validation and mapping
if [ "${OS_ARG}" != "darwin" ] && [ "${OS_ARG}" != "win32" ]; then
    echo "${0} error: Unsupported OS_ARG=>${OS_ARG}<. Only 'darwin' and 'win32' are supported."
    exit 1
fi

if [ "${ARCH_ARG}" != "x64" ] && [ "${ARCH_ARG}" != "arm64" ]; then
    echo "${0} error: Unsupported ARCH_ARG=>${ARCH_ARG}<. Only 'x64' and 'arm64' are supported."
    exit 1
fi

# Clear the entire bin directory to ensure only the requested binaries for this OS/ARCH are present
BIN_DIR="${DIR}/bin"
TARGET_DIR="${BIN_DIR}/${OS_ARG}/${ARCH_ARG}"

echo "🧹 Clearing existing binaries in ${BIN_DIR}..."
rm -rf "${BIN_DIR}"

# Create directory structure
mkdir -p "${TARGET_DIR}"

# Map OS_ARG and ARCH_ARG to rclone's naming convention using clear if-else blocks
OS_MAP="${OS_ARG}"
if [ "${OS_ARG}" = "darwin" ]; then
    OS_MAP="osx"
elif [ "${OS_ARG}" = "win32" ]; then
    OS_MAP="windows"
fi

ARCH_MAP="${ARCH_ARG}"
if [ "${ARCH_ARG}" = "x64" ]; then
    ARCH_MAP="amd64"
fi

ASSET_NAME="rclone-v${VERSION}-${OS_MAP}-${ARCH_MAP}"
ZIP_NAME="${ASSET_NAME}.zip"
URL="https://github.com/rclone/rclone/releases/download/v${VERSION}/${ZIP_NAME}"


cat <<EOF
--------------------------------------------------------
📥 Downloading Rclone binary for ${OS_ARG} ${ARCH_ARG}...
URL: ${URL}
--------------------------------------------------------
EOF

TEMP_DIR="${DIR}/tmp_download"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"
trap 'rm -rf "${TEMP_DIR}"' EXIT

ZIP_PATH="${TEMP_DIR}/${ZIP_NAME}"


if ! curl -L -f -o "${ZIP_PATH}" "${URL}"; then
    echo "${0} error: Failed to download rclone from source URL=>${URL}<"
    exit 1
fi

if [ ! -f "${ZIP_PATH}" ]; then
    echo "${0} error: Zip file not found after download at expected location: ZIP_PATH=>${ZIP_PATH}<"
    exit 1
fi

echo "📦 Extracting rclone..."
unzip -q "${ZIP_PATH}" -d "${TEMP_DIR}"

BINARY_NAME="rclone"
if [ "${OS_ARG}" = "win32" ]; then
    BINARY_NAME="rclone.exe"
fi

SOURCE_BINARY="${TEMP_DIR}/${ASSET_NAME}/${BINARY_NAME}"
TARGET_BINARY="${TARGET_DIR}/${BINARY_NAME}"

if [ ! -f "${SOURCE_BINARY}" ]; then
    cat <<EOF
${0} error: Binary not found at expected location: SOURCE_BINARY=>${SOURCE_BINARY}<
Contents of extracted dir:
EOF
    ls -R "${TEMP_DIR}"

    exit 1
fi

cp "${SOURCE_BINARY}" "${TARGET_BINARY}"
chmod +x "${TARGET_BINARY}"

cat <<EOF
--------------------------------------------------------
✅ Binary ready in ${TARGET_DIR}
--------------------------------------------------------
EOF
ls -lah "${TARGET_BINARY}"

# Audit: Check if there is EXACTLY 1 file in the bin directory tree
FILE_COUNT=$(find "${BIN_DIR}" -type f | wc -l | xargs)
if [ "${FILE_COUNT}" != "1" ]; then
    cat <<EOF
${0} error: Audit failed. Expected 1 file in BIN_DIR=>${BIN_DIR}<, but found FILE_COUNT=>${FILE_COUNT}<
Directory structure:
EOF
    find "${BIN_DIR}" -maxdepth 4 -ls
    exit 1
fi
echo "Audit passed: found exactly ${FILE_COUNT} file in ${BIN_DIR}."
