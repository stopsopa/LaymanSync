---
name: coding-style
description: General coding style for this project
---

# Error messages

Preffer messages

```ts

throw new Error(`${this module name.ts} error: ${errorMessage}`);

// instead of

throw new Error(`${errorMessage}`);

```

... make sure each error clearly states it's origin
