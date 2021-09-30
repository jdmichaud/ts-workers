import { Queue, ThreadBuilder, Thread } from '../src';

(window as any).Queue = Queue;
(window as any).ThreadBuilder = ThreadBuilder;
(window as any).Thread = Thread;

async function main(): Promise<void> {
  const queue = ThreadBuilder
    .create(delay => new Promise(resolve => setTimeout(() => resolve("hello"), delay)))
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
