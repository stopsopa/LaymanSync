# 
# /bin/bash electron/download-bins-test.sh
#   Iterates through all combinations of OS and ARCH to test download-bins.sh
# 

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e

# Move to the directory where the script is located
cd "${DIR}"

OS_LIST=("darwin" "win32")
ARCH_LIST=("x64" "arm64")

for OS in "${OS_LIST[@]}"; do
    for ARCH in "${ARCH_LIST[@]}"; do
        cat <<EOF



            ========================================================
            🚀 Testing: OS=${OS}, ARCH=${ARCH}
            ========================================================




EOF
        
        if ! /bin/bash "${DIR}/download-bins.sh" "${OS}" "${ARCH}"; then
            echo "${0} error: Test FAILED for OS=>${OS}<, ARCH=>${ARCH}<"
            exit 1
        fi
        
        echo "✅ Test PASSED for OS=${OS}, ARCH=${ARCH}"
    done
done

cat <<EOF

========================================================
🎉 All test combinations passed successfully!
========================================================
EOF
