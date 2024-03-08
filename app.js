'use strict';

const express = require("express");
const app = express();
const puppeteerExtra = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
const proxyChain = require('proxy-chain');

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

const getDirectLink = async (url) => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  let proxyServer = 'http://paorsnok-rotate:3gelpkdyzj63@p.webshare.io:80';
  proxyServer = await proxyChain.anonymizeProxy(proxyServer);

  const browser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--ignore-certificate-errors', `--proxy-server=${proxyServer}`]
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

  const captchaBtn = '.g-recaptcha';
  await page.waitForSelector(captchaBtn);
  await page.click(captchaBtn);
  await page.waitForNavigation();

  const content = await page.content();
  console.log(content);

  let link = await page.evaluate(
    () =>
    Array.from(document.querySelectorAll('a'))
    .filter(el => el.innerText === 'Direct Download Link')
    .map(el => el.getAttribute('href'))
  );

  await browser.close();

  return link;
};