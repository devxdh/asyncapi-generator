---
"@asyncapi/generator": major
---

Remove deprecated `conditionalFiles` template configuration in favor of `conditionalGeneration`.
Templates must now use `conditionalGeneration` with either `subject` or `parameter` conditions for conditional file and folder rendering.
