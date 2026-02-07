

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"

DIR="structures"

rm -rf "${DIR}"
function cfiles {    
    DIR1="${1}"
    mkdir -p "${DIR1}"
    touch "${DIR1}/file1.txt"
    touch "${DIR1}/file2.txt"
    touch "${DIR1}/file3.txt"
    touch "${DIR1}/file4.txt"

}
function set1 {
    _DIR="${1}/child"
    mkdir -p "${_DIR}"

    touch "${_DIR}/file1.txt"
    touch "${_DIR}/file2.txt"
    touch "${_DIR}/file3.txt"
    touch "${_DIR}/file4.txt"
    
    cfiles "${_DIR}/child1"

    cfiles "${_DIR}/child2"

    cfiles "${_DIR}/child3"

    cfiles "${_DIR}/child4"
}

set1 "${DIR}/dir01"
set1 "${DIR}/dir02"
set1 "${DIR}/dir03"
set1 "${DIR}/dir04"
set1 "${DIR}/dir05"
set1 "${DIR}/dir06"
set1 "${DIR}/dir07"
set1 "${DIR}/dir08"
set1 "${DIR}/dir09"
set1 "${DIR}/dir10"

mkdir -p "${DIR}/target01"
mkdir -p "${DIR}/target02"
mkdir -p "${DIR}/target03"
mkdir -p "${DIR}/target04"
mkdir -p "${DIR}/target05"
mkdir -p "${DIR}/target06"
mkdir -p "${DIR}/target07"
mkdir -p "${DIR}/target08"
mkdir -p "${DIR}/target09"
mkdir -p "${DIR}/target10"
