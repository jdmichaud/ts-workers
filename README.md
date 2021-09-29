# ts-workers

A thin typescript layer on top of the [Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
to facilite its usage in a typesafe way.

[For example](dev/main.ts):
```typescript
import { Task } from '../src';

async function main(): Promise<void> {
  const res: number = await Task.create((b: number) => b * 2).createThread().run(21);
  console.log(res); // 42
}

window.onload = main;
```

Types are checked:
```typescript
  // Compilation will fail because the return type is not string but number.
  const res: string = await Task.create((b: number) => b * 2).createThread().run(21);
  // Here the parameter type is incorrect.
  const res: number = await Task.create((b: number) => b * 2).createThread().run('21');
```

You can create multiple workers for parallel work:
```typescript
import { Task } from '../src';

async function main(): Promise<void> {
  const sharedArray = new SharedArrayBuffer(16);
  const parallelWorkers = Task.create((buffer, index, length) => {
    const bytearray = new Uint8Array(buffer);
    for (let i = index; i < index + length; ++i) {
      bytearray[i] = i;
    }
  }).createThreads(4);

  await Promise.all([
    parallelWorkers[0].run(sharedArray, 0, 4),
    parallelWorkers[1].run(sharedArray, 4, 4),
    parallelWorkers[2].run(sharedArray, 8, 4),
    parallelWorkers[3].run(sharedArray, 12, 4),
  ]);

  const byteArray = new Uint8Array(sharedArray);
  for (let i = 0; i < byteArray.length; ++i) {
    console.log(byteArray[i]);
  }
}

window.onload = main;
```

# How to use

Simply install it from the npm registry:
```bash
npm install @jdmichaud/ts-workers
```

# Contributions

Clone the project:
```bash
git clone <this repo>
```

Install dependencies:
```bash
npm install
```

Build:
```bash
npm run all
```

Launch the developement application:
```bash
npm run dev
```

# License

MIT © Jean-Daniel Michaud
