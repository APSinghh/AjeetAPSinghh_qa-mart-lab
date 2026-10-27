# 1. Instructions

Instructions are guidance Copilot reads without being asked. They steer; they do not enforce (that is hooks).

## Story I1: One set of house rules, always on
As a QA lead, I want Copilot to follow our Playwright conventions on every request so that generated tests pass review the first time.

**Before you build.** In a new chat ask: "Write a Playwright test that signs in as the locked user and checks the error message." Save the result. Notice what review would reject.

**Build.** Create `.github/copilot-instructions.md` from the rules in `docs/team-conventions.md`.
- Keep it short and about this project. Say why a rule exists where it is not obvious (for example: v2 reorders products, so positional selectors break).
- Include one good and one bad code pattern, taken from `tests/tour/` and `tests/legacy/`.

**Done when**
- The same prompt now gives a test with `getByRole`/`getByLabel`, credentials from `tests/test-data.ts`, a web-first assertion and no `waitForTimeout`.
- **References** lists `copilot-instructions.md`.
- `npm run lint:specs` passes on the generated file.

**Watch out**: a long file dilutes the rules. If the model ignores one, make it shorter, not louder.

## Story I2: Rules that only apply to some files
As a QA engineer, I want Page Object rules to apply only when Copilot edits `pages/` and spec rules only for specs, so that each task gets the right guidance and nothing extra.

**Build.** Create two files in `.github/instructions/`:
- `page-objects.instructions.md` with `applyTo: 'pages/**/*.ts'`: locators and actions only, no assertions, one class per page, file name `<Name>Page.ts`.
- `specs.instructions.md` with `applyTo: 'tests/**/*.spec.ts'`: story id in the test title, use `tests/fixtures.ts`, wrap flows in `test.step`.

**Done when**
- Ask for a `LoginPage` Page Object. **References** shows `page-objects.instructions.md` and not `specs.instructions.md`.
- Ask for a spec that uses it. The reverse happens.
- The `description` of each file tells the agent when it is relevant even without a matching path.

**Stretch**: move shared wording into `copilot-instructions.md` and link to it from the two files instead of copying.

## Check yourself
| Symptom | Likely cause |
|---|---|
| File not listed in Customizations | Wrong folder or extension |
| Listed but not used | `applyTo` does not match the file Copilot edited; `description` too vague |
| Rules contradict each other | Two files say different things; instructions are additive |
