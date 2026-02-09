

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
    _DIR="${DIR}/dir${1}/child"
    mkdir -p "${_DIR}"
    echo "test${1}" > "${_DIR}/__dir_${1}.txt"

    touch "${_DIR}/${1}_file1.txt"
    touch "${_DIR}/${1}_file2.txt"
    touch "${_DIR}/${1}_file3.txt"
    touch "${_DIR}/${1}_file4.txt"
    
    cfiles "${_DIR}/${1}_child1"

    cfiles "${_DIR}/${1}_child2"

    cfiles "${_DIR}/${1}_child3"

    cfiles "${_DIR}/${1}_child4"
}

set1 "01"
set1 "02"
set1 "03"
set1 "04"
set1 "05"
set1 "06"
set1 "07"
set1 "08"
set1 "09"
set1 "10"

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
