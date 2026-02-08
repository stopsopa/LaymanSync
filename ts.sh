DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# add --watch flag for dev mode

source "${DIR}/.env.sh"

set -e

export NODE_NO_WARNINGS=1

# add to gitignore /coverage/
# require ts-resolver.js
# require node-suppress-warning.js
# require node.config.json

NODE_CMD=(node --experimental-config-file="${DIR}/node.config.json" --experimental-loader="${DIR}/ts-resolver.js" --import "file://${DIR}/node-suppress-warning.js")

if [[ "${@}" == *"--test"* ]]; then
  rm -rf "${DIR}/coverage"
  # without c8 ... - test will work like nothing happened but coverage directory won't be created
  # requires c8 (npx will handle it)

  REPORTERS=(--reporter=lcov --reporter=html --reporter=text)

  if [ -n "${SILENT}" ]; then
    REPORTERS=(--reporter=lcov --reporter=html)
  fi

  NODE_OPTIONS="" npx c8 "${REPORTERS[@]}" \
    env NODE_OPTIONS="$NODE_OPTIONS" "${NODE_CMD[@]}" "${@}"
else
  "${NODE_CMD[@]}" "${@}"
fi
