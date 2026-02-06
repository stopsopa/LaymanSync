# /bin/bash electron/src/tools/cli.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$(cd "${DIR}/../../.." && pwd)"

cd "${ROOT}"

export NODE_OPTIONS=""

# export BWLIMIT="1k"
export BWLIMIT="10"
# export DRY_RUN="true"

set -e

TARGET="electron/node_modules2"
rm -rf "${TARGET}"

CMD="$(/bin/bash ts.sh electron/src/tools/cli.ts -s "electron/node_modules" -d "${TARGET}")"

cat <<EEE

${CMD}

EEE

read -p "Press [Enter] key to continue..."

eval "${CMD}"
