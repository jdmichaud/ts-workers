import { Queue, ThreadBuilder, Thread } from '../../src';

(window as any).Queue = Queue;
(window as any).ThreadBuilder = ThreadBuilder;
(window as any).Thread = Thread;

async function main(): Promise<void> {
  let running = true;
  const stopbtn = document.getElementById('stopbtn');
  stopbtn!.addEventListener('click', () => running = false);

  const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (ctx == null) throw new Error('cannot get context');

  const sab = new SharedArrayBuffer(canvas.width * canvas.height * 4);
  const arrayOut = new Uint32Array(sab);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const arrayIn = new Uint32Array(imageData.data.buffer);

  const queue = ThreadBuilder
    .create((data, start, length) => {
      const R = (data[start] & 0x000000FF) + 1;
      const G = R << 8;
      const B = R << 16;
      for (let i = start; i < start + length; ++i) {
        data[i] = 0xFF000000 | B | G | R;
      }
    })
    .createThreads(navigator.hardwareConcurrency)
    .queue();
  const nbJobs = navigator.hardwareConcurrency;
  console.log(`using ${nbJobs} jobs`);
  const length = (canvas.width * canvas.height) / nbJobs | 0;
  const params = Array.from(Array(nbJobs))
    .map((_, index) => [arrayOut, index * length,
      (index === nbJobs - 1) ? arrayOut.length - (index * length) : length]);

  const timings = [] as any[];

  const interval = setInterval(() => {
    const nbTimings = timings.length;
    const sums = timings.reduce((acc, { preparationTime, processingTime, drawTime, totalTime }) => {
      acc[0] += preparationTime;
      acc[1] += processingTime;
      acc[2] += drawTime;
      acc[3] += totalTime;
      return acc;
    }, [0, 0, 0, 0]);
    console.log(`preparationTime: ${sums[0] / nbTimings}, processingTime: ${sums[1] / nbTimings}, drawTime: ${sums[2] / nbTimings}, totalTime: ${sums[3] / nbTimings}`);
  }, 1000);

  while (running) {
    const start = Date.now();

    arrayOut.set(arrayIn); // memcpy

    const processing = Date.now();
    // console.log(`SharedArrayBuffer ready in ${processing - start} ms`);
    const preparationTime = processing - start;

    const promises = queue.run(params as any);
    await Promise.all(promises);

    const putImage = Date.now();
    // console.log(`Processing in ${putImage - processing} ms`);
    const processingTime = putImage - processing;

    const imageData32 = new Uint32Array(imageData.data.buffer);
    imageData32.set(arrayOut);
    ctx.putImageData(imageData, 0, 0);

    // console.log(`putImageData in ${Date.now() - putImage} ms`);
    const drawTime = Date.now() - putImage;

    // console.log(`done in ${Date.now() - start} ms`);
    const totalTime = Date.now() - start;
    if (timings.length > 1000) {
      timings.shift();
    }
    timings.push({ preparationTime, processingTime, drawTime, totalTime });
  }

  clearInterval(interval);
}

window.onload = main;
