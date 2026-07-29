const waitForImage = (image: HTMLImageElement) => {
  if (image.complete) return Promise.resolve();
  return new Promise<void>(resolve => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  });
};

export async function printTarget(selector: string) {
  const source = document.querySelector<HTMLElement>(selector);
  if (!source) return;
  const isDirectChild = source.parentElement === document.body;
  const target = isDirectChild ? source : source.cloneNode(true) as HTMLElement;
  if (!isDirectChild) {
    target.classList.add('print-report');
    document.body.appendChild(target);
  }

  document.body.classList.add('print-isolating');
  target.classList.add('print-target-active');
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(Array.from(target.querySelectorAll('img')).map(waitForImage));
    window.print();
  } finally {
    target.classList.remove('print-target-active');
    if (!isDirectChild) target.remove();
    document.body.classList.remove('print-isolating');
  }
}
