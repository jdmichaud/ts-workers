/**
 * @preserve
 * Copyright 2021 Jean-Daniel Michaud
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Thread } from './thread';

export class Task<OutputType, T extends any[]> {
  static create<OutputType, T extends any[]>(task: (...args: T) => OutputType): Task<OutputType, T> {
    return new Task<OutputType, T>(Task.makeTask(task));
  }

  private static makeTask<OutputType, T extends any[]>(task: (...args: T) => OutputType): string {
    return `
      onmessage = (msg) => {
        postMessage((${task.toString()})(...msg.data));
      };
    `;
  }

  private constructor(private readonly task: string) {}

  createThread(): Thread<OutputType, T> {
    const blob = new Blob([this.task], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    return Thread.create(worker);
  }

  createThreads(nThread: number): Thread<OutputType, T>[] {
    return Array.from(Array(nThread)).map(_ => this.createThread());
  }
}
