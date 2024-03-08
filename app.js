'use strict';

const express = require("express");
const app = express();
const puppeteerExtra = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(Stealth());

app.get('/', function (req, res) {
  res.send("I'm online");
});

app.get("/get", async (req, res) => {
  const url = req.query.url;
  if (!url || url == "") {
    res.status(400).send({
      message: 'Invalid parameter'
    });
  }

  const get = await getDirectLink(url);
  res.json(get);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getDirectLink = async (url) => {
  const browser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--ignore-certificate-errors']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.setViewport({
    width: 1280,
    height: 720
  });

  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  await new Promise(r => setTimeout(r, 1000)); // wait 1 seconds

  await page.mouse.move(0, 0);
  await page.mouse.down();
  const totalMovement = randomInt(4, 8);

  for (let i = 1; i <= randomInt; i++) {
    await page.mouse.move(randomInt(100, 600), randomInt(100, 600));
    await new Promise(r => setTimeout(r, 500)); // wait 0,5 seconds
  }

  await page.mouse.up();
  await new Promise(r => setTimeout(r, 1000)); // wait 1 seconds

  const captchaBtn = '.g-recaptcha';
  const captcha = await page.waitForSelector(captchaBtn);
  const rect = await page.evaluate(el => {
    const {
      x,
      y
    } = el.getBoundingClientRect();
    return {
      x,
      y
    };
  }, captcha);

  await page.mouse.click(rect.x + 50, rect.y + 50);
  // await page.click(captchaBtn);
  await page.waitForNavigation();

  await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds

  const content = await page.content();
  console.log(content);

  // let link = await page.evaluate(
  //   () =>
  //   Array.from(document.querySelectorAll('a'))
  //   .filter(el => el.innerText === 'Direct Download Link')
  //   .map(el => el.getAttribute('href'))
  // );

  await browser.close();

  return 'link';
};