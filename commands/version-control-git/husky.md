## Summary

The goal of this command is to verify the repo is in a working state and fix issues if they exist.

## Goals

Run CI checks and fix issues until repo is in a good state and then add files to staging. All commands are run from repo root.
0. Make sure repo is up to date via running `pnpm i`
1. Check that the linter passes by running `pnpm lint`
2. Check that types and build pass by running `pnpm nx run-many --targets=build:types,build:dist,build:app,generate:docs,dev:run,typecheck`. 
   If one of the specific commands fail, save tokens via only running that command while debugging
3. Check that tests pass via running `pnpm nx run-many --target=test:coverage`
   Source the .env file first before running if it exists
4. Check package.json is sorted via running `pnpm run sort-package-json`
5. Check packages are linted via running `pnpm nx run-many --targets=lint:package,lint:deps`
6. Double check. If you made any fixes run preceeding checks again. For example, if you made fixes on step 3. run steps 1., 2., and 3. again to doublecheck there wasn't a regression on the earlier step.
7. Add files to staging with `git status` and `git add`. Make sure you don't add any git submodules in the `lib/*` folders though

Do NOT continue on to the next step until the command listed succeeds. You may sometimes have prompts in between or have to debug but always continue on unless I specifically give you permission to skip a check.
Print the list of tasks with a checkmark emoji next to every step that passed at the very end

## Protocol when something breaks

Take the following steps if CI breaks

### 1. Explain why it's broke

- Whenever a test is broken first give think very hard and a complete explanation of what broke. Cite source code and logs that support your thesis.
- If you don't have source code or logs to support your thesis, think hard and look in codebase for proof. 
- Add console logs if it will help you confirm your thesis or find out why it's broke
- If you don