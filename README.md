# ts-workers

A thin typescript layer on top of the [Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
to facilite its usage in a typesafe way. For example:
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

Queue can be used to spread tasks to a pool of workers:
```typescript
import { Queue, ThreadBuilder, Thread } from '../src';

async function main(): Promise<void> {
  const queue = ThreadBuilder
    .create(delay => new Promise<void>(resolve => setTimeout(() => resolve(), delay)))
    .createThreads(navigator.hardwareConcurrency)
    .queue();
  const delays = Array.from(Array(navigator.hardwareConcurrency * 2))
    .map(_ => [Math.random() * 1000 | 0]);
  const promises = queue.run(delays as any);

  promises.forEach((promise, index) => {
    const span = document.createElement('span');
    span.innerText = Number(delays[index]).toString();
    span.style.backgroundColor = '#F00';
    const div = document.createElement('div');
    div.appendChild(span);
    document.body.appendChild(div);
    promise.then(() => span.style.backgroundColor = '#0F0')
  })
}

window.onload = main;
```

# How to use

Simply install it from the npm registry:
```bash
npm install @jdmichaud/ts-workers
```

# Limitations

* Works only on browsers implementing ES2020.

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
