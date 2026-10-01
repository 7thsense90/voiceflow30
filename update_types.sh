#!/bin/bash
cat src/types.ts | grep -v 'export interface Brand' > src/types.ts.tmp
mv src/types.ts.tmp src/types.ts
