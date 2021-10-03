import { ThreadBuilder } from '../../src';

async function main(): Promise<void> {
  let running = true;
  // The button to stop the while loop
  const stopbtn = document.getElementById('stopbtn');
  stopbtn!.addEventListener('click', () => running = false);
  // Create the canvas and retrieve the context
  const canvas: HTMLCanvasElement = document.getElementById('viewport') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (ctx == null) throw new Error('cannot get context');
  // Create the shared array buffer, retrieve the pixels and set the pixels in the SAB.
  const sab = new SharedArrayBuffer(canvas.width * canvas.height * 4);
  const arrayOut = new Uint32Array(sab);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const arrayIn = new Uint32Array(imageData.data.buffer);
  arrayOut.set(arrayIn); // memcpy
  // Create the workers and their parameters.
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
  // The number of tasks is not necessarily the same as the number of workers.
  const nbJobs = navigator.hardwareConcurrency;
  console.log(`using ${nbJobs} jobs`);
  const length = (canvas.width * canvas.height) / nbJobs | 0;
  const params = Array.from(Array(nbJobs))
    .map((_, index) => [arrayOut, index * length,
      (index === nbJobs - 1) ? arrayOut.length - (index * length) : length]);

  const timings = [] as any[];

  const interval = setInterval(() => {
    const nbTimings = timings.length;
    const sums = timings.reduce((acc, { processingTime, drawTime, totalTime }) => {
      acc[0] += processingTime;
      acc[1] += drawTime;
      acc[2] += totalTime;
      return acc;
    }, [0, 0, 0]);
    console.log(`processingTime: ${sums[0] / nbTimings}, drawTime: ${sums[1] / nbTimings}, totalTime: ${sums[2] / nbTimings}`);
  }, 1000);

  while (running) {
    const start = Date.now();
    // Run the tasks and wait for them to finish.
    const promises = queue.run(params as any);
    await Promise.all(promises);

    const putImage = Date.now();
    const processingTime = putImage - start;
    // Set the result into the already retrieved ImageData and put the pixels
    // in the canvas.
    arrayIn.set(arrayOut);
    ctx.putImageData(imageData, 0, 0);

    const drawTime = Date.now() - putImage;

    const totalTime = Date.now() - start;
    if (timings.length > 1000) {
      timings.shift();
    }
    timings.push({ processingTime, drawTime, totalTime });
  }

  clearInterval(interval);
}

window.onload = main;
