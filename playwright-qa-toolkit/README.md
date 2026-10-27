# playwright-qa-toolkit

## 1. Overview

A minimal Agent Plugins 1.0 plugin for reviewing Playwright tests and analyzing test failures.

## 2. Included components

| Type | Name | Purpose |
|------|------|---------|
| Skill (portable) | `playwright-failure-analysis` | Analyzes failures, finds probable root causes, recommends fixes |
| Agent (GitHub Copilot-specific) | `test-reviewer` | Reviews Playwright tests for reliability and maintainability |

## 3. Folder structure

```
playwright-qa-toolkit/
├── plugin.json
├── README.md
├── skills/
│   └── playwright-failure-analysis/
│       └── SKILL.md
└── com.github.copilot/
    └── agents/
        └── test-reviewer.agent.md
```

## 4. Local registration

Add this to your VS Code user settings (Windows). Replace the path with the actual absolute path of this folder.

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "C:\\absolute\\path\\to\\playwright-qa-toolkit": true
  }
}
```

Unix/macOS:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "/absolute/path/to/playwright-qa-toolkit": true
  }
}
```

The path must be replaced with the real absolute path on your machine.

## 5. Verification

1. Reload or restart VS Code if required.
2. Open Extensions.
3. Enter `@agentPlugins`.
4. Check the Installed section for `playwright-qa-toolkit`.
5. Open Chat > Open Customizations.
6. Confirm these are visible:
   - `playwright-failure-analysis`
   - `test-reviewer`
7. Disable the plugin and verify both components disappear.
8. Enable it again and verify both return.

## 6. Sample prompts

- Use the playwright-failure-analysis skill to analyze this Playwright timeout.
- Use the test-reviewer agent to review my Playwright test.
- Review this test for weak locators, hard-coded waits, and flaky behavior.
- Analyze this failure and separate an application defect from a test automation defect.

## 7. Troubleshooting

- **Plugin not listed:** Check `chat.plugins.enabled`, the absolute plugin path, the plugin name, JSON validity, and VS Code experimental feature availability.
- **Skill not visible:** Confirm the folder is named `playwright-failure-analysis` and the `SKILL.md` frontmatter `name` matches exactly.
- **Agent not visible:** Confirm the file is under `com.github.copilot/agents` and uses the `.agent.md` extension.
- **Duplicate behavior:** Search for duplicate skill or agent copies under `.github` and other registered plugin locations.

## 8. Removal or disable

- Disable: set the path to `false` in `chat.pluginLocations`, or disable it from `@agentPlugins` in Extensions.
- Remove: delete the path entry from `chat.pluginLocations`, then delete this folder if no longer needed.

## 9. Safety notes

- The agent does not modify files unless explicitly asked.
- Do not paste credentials, tokens, cookies, or storage-state contents into prompts.
- Review suggested code changes before applying them.
