// to install go to: https://stopsopa.github.io//pages/bash/index.html#xx

// https://stopsopa.github.io/viewer.html?file=%2Fpages%2Fbash%2Fxx%2Fxx-template.cjs
// edit: https://github.com/stopsopa/stopsopa.github.io/blob/master/pages/bash/xx/xx-template.cjs

// 🚀 -
// ✅ -
// ⚙️  -
// 🗑️  -
// 🛑 -
// to call other xx commands from inside any xx command use:
//    shopt -s expand_aliases && source ~/.bashrc
// after that just do:
//   xx <command_name>

module.exports = (setup) => {
  return {
    help: {
      command: `
set -e  
        
cat <<EEE

  🐙 GitHub: $(git ls-remote --get-url origin | awk '{\$1=\$1};1' | tr -d '\\n' | sed -E 's/git@github\\.com:([^/]+)\\/(.+)\\.git/https:\\/\\/github.com\\/\\1\\/\\2/g')

-- DEV NOTES --

/bin/bash electron/download-bins.sh
  # WARNING: run this at least once
  # bring binary for our OS and architecture

  dev server (xx "dev server"):
    http://localhost:4286/
    http://localhost:4286/public/download.html

EEE

      `,
      description: "Status of all things",
      source: false,
      confirm: false,
    },
    [`npm`]: {
      command: `
cat <<EEE

npm install -g c8 

EEE

`,
      description: `npm`,
      confirm: false,
    },
    [`ts`]: {
      command: `
cat <<EEE

/bin/bash ts.sh [path to *.ts file]

EEE

`,
      description: `run typescript`,
      confirm: false,
    },
    [`test`]: {
      command: `
cat <<EEE

/bin/bash ts.sh --test
/bin/bash ts.sh --test electron/tools/categorizeFrameRate.test.ts

EEE

`,
      description: `test`,
      confirm: false,
    },
    [`coverage`]: {
      command: `   
FILE="coverage/index.html"
if [ ! -f "\${FILE}" ]; then

  cat <<EEE

  file >\${FILE}< doesn't exist
  
  to generate manually

EEE
  
  exit 1
fi  

FILE="file://\$(realpath "\${FILE}")"   

cat <<EEE

Ways to open:
    open "\${FILE}"
    open -a "Google Chrome" "\${FILE}"

EEE

echo -e "\\n      Press enter to continue\\n"
read

open "\${FILE}"
      `,
      confirm: false,
    },

    [`dev server`]: {
      command: `
PORT="4286"
cat <<EEE

    http://localhost:\${PORT}
EEE

echo -e "\n      Press enter to continue\n"
read

TARGET="./"

# detect python version and run one or another version
cd "\${TARGET}"
if python3 -c "import http.server" > /dev/null 2>&1; then
    echo -e "\nrunning: python3 -m http.server \${PORT}\n"
    python3 -m http.server \${PORT}
elif python -c "import http.server" > /dev/null 2>&1; then
    echo -e "\nrunning: python -m http.server \${PORT}\n"
    python -m http.server \${PORT}
elif python -c "import SimpleHTTPServer" > /dev/null 2>&1; then
    echo -e "\nrunning: python -m SimpleHTTPServer \${PORT}\n"
    python -m SimpleHTTPServer \${PORT}
else
    echo -e "\nPython http server module not found\n"
    exit 1
fi
`,
      confirm: false,
    },

    ...setup,
  };
};
