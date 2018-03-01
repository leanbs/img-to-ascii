const canvas = document.querySelector('#preview');
const fileInput = document.querySelector('input[type="file"]');
const asciiImage = document.querySelector('#ascii');

const context = canvas.getContext('2d');

// grayscale formula : https://en.wikipedia.org/wiki/Grayscale
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (ev) => {
    const image = new Image();
    image.onload = () => {
      // const [width, height] = [image.width, image.height];
      const [width, height] = clampDimensions(image.width, image.height);

      canvas.width = width;
      canvas.height = height;

      context.drawImage(image, 0, 0, width, height);
      const grayScales = convertToGrayScales(context, width, height);

      fileInput.style.display = 'none';
      drawAscii(grayScales, width);
    }
    image.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

const convertToGrayScales = (context, width, height) => {
  const imageData = context.getImageData(0, 0, width, height);
  const grayScales = [];

  for (let i = 0; i < imageData.data.length; i+=4) {
    const [r, g, b] = [imageData.data[i], imageData.data[i +1], imageData.data[i+2]];

    const grayScale = toGrayScale(r, g, b);
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;
    grayScales.push(grayScale);
  }
  context.putImageData(imageData, 0, 0);
  return grayScales;
}

const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const rampLength = grayRamp.length;

// the grayScale value is an integer ranging from 0 (black) to 255 (white)
const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

const drawAscii = (grayScales, width) => {
  const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
    let nextChars = getCharacterForGrayScale(grayScale);

    if ((index + 1) % width === 0) {
      nextChars += '\n';
    }

    return asciiImage + nextChars;

  }, '');

  asciiImage.textContent = ascii;
};

const MAXIMUM_WIDTH = 80;
const MAXIMUM_HEIGHT = 50;

const clampDimensions = (width, height) => {
  if (height > MAXIMUM_HEIGHT) {
    const reducedWidth = Math.floor(width * MAXIMUM_HEIGHT / height);
    return [reducedWidth, MAXIMUM_HEIGHT];
  }

  if (width > MAXIMUM_WIDTH) {
    const reducedHeight = Math.floor(width * MAXIMUM_WIDTH / width);
    return [MAXIMUM_WIDTH, reducedWidth];
  }

  return [width, height];
}