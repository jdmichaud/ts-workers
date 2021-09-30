/**
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

export class Queue<OutputType, T extends any[]> {
  private availableThreads: Thread<OutputType, T>[];
  private runningThread: Thread<OutputType, T>[] = [];
  private waiting: (() => void)[] = [];

  static create<OutputType, T extends any[]>(threadPool: Thread<OutputType, T>[])
    : Queue<OutputType, T> {
    return new Queue<OutputType, T>(threadPool);
  }

  private constructor(private readonly threadPool: Thread<OutputType, T>[]) {
    this.availableThreads = threadPool;
  }

  run(tasks: T[]): Promise<OutputType>[] {
    const promises = [];
    for (const task of tasks) {
      promises.push(this.getThread().then(thread => {
        this.runningThread.push(thread);
        return thread.run(...task).then(result => {
          this.runningThread = this.runningThread.filter(t => t != thread);
          this.availableThreads.push(thread);
          const waiting = this.waiting.pop();
          if (waiting !== undefined) waiting();
          return result;
        });
      }));
    }
    return promises;
  }

  private getThread(): Promise<Thread<OutputType, T>> {
    const thread = this.availableThreads.pop();
    if (thread !== undefined) {
      return Promise.resolve(thread);
    }
    return new Promise(resolve => {
      this.waiting.push(() => {
        const availableThread = this.availableThreads.pop();
        if (availableThread === undefined) {
          throw new Error('Internal error (notified without available thread)');
        }
        resolve(availableThread);
      });
    });
  }
}