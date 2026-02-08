
# 
# /bin/bash testbatch.sh structure.json structure-gen.json
# 

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "${DIR}"

INPUT_FILE="${1}"
OUTPUT_FILE="${2}"

if [[ -z "${INPUT_FILE}" ]] || [[ -z "${OUTPUT_FILE}" ]]; then
    cat <<EEE
testbatch.sh error: missing arguments
Usage: /bin/bash testbatch.sh <input-json> <output-json>
EEE
    exit 1
fi

echo "testbatch.sh: Running structures.sh..."
set -e
/bin/bash "${DIR}/structures.sh"
set +e
echo "testbatch.sh: structures.sh: OK"

# Run the command and capture output (both stdout and stderr)
echo "testbatch.sh: Generating ${OUTPUT_FILE} from ${INPUT_FILE}..."
OUTPUT="$(NODE_OPTIONS="" /bin/bash "${DIR}/ts.sh" generate-structure-json.ts "${INPUT_FILE}" 2>&1)"
EXIT_CODE="${?}"

if [[ "${EXIT_CODE}" != "0" ]]; then
    # If not good, print output to stdout
    cat <<EEE
${OUTPUT}
testbatch.sh error: generate-structure-json.ts failed with exit code ${EXIT_CODE}
EEE

# Forward exit code
exit "${EXIT_CODE}"

fi

# If successful, redirect (save) output to the specified output file
printf "%s" "${OUTPUT}" > "${OUTPUT_FILE}"

cat <<EEE

testbatch.sh: ${OUTPUT_FILE}: OK

EEE

/bin/bash ts.sh electron/src/tools/driveCompressionMultiple.ts structure-gen.json


