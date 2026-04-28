```

  [ START ] Push to branch OR Manual Trigger
      |
      v
[ Build & Release Pipeline ] (pipeline.yml)
      |
      +--> [ 🧪 Tests & Base Build ] (Uploads 'built-code')
      |          |
      |          +-- [ 🛡️ Test Gate ] (Human Click) --> [ 🍴 Test Build ]
      |          |
      |          +-- [ 🛡️ QA Gate   ] (Human Click) --> [ 🚧 QA Build ] (Mac/Win binaries)
      |          |
      |          +-- [ 🛡️ Prod Gate ] (Human Click) --> [ 🚀 Bump Version ] (semantic-release)
      |                                                        |
      |                                            (If new version tagged)
      |                                                        |
      |                                                        +--> [ Release Build ] (release.yml)
      |                                                        |         |
      |                                                        |         +--> Official DMG/EXE
      |                                                        |
      |                                                        +--> [ Deploy Pages ] (deploy-pages.yml)
      v
   [ END ]



```

| Workflow Label | File | Grug Description |
| :--- | :--- | :--- |
| **Build & Release Pipeline** | `pipeline.yml` | **START HERE.** Big boss. Run tests and handle gates. |
| **Release Build** | `release.yml` | Heavy lifter. Make DMG and EXE. Called by Boss. |
| **Deploy branches to GitHub Pages** | `deploy-pages.yml` | Make website update. Called by Boss. |
| **Demo - Manual Inputs & Choices** | `demo-choice.yml` | Just for play. Not real release. |
| **pages-build-deployment** | `N/A` | GitHub internal magic for Pages. Ignore. |


# Trigger manually

Go to Actions tab -> Build & Release Pipeline -> Click Run workflow.