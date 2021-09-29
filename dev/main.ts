import { Task, Thread } from '../src';

(window as any).Task = Task;
(window as any).Thread = Thread;

async function main(): Promise<void> {
  const res: number = await Task.create((b: number) => b * 2).createThread().run(21);
  console.log(res);
}

window.onload = main;
