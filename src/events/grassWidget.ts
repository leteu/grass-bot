import { ContributionDay } from "../commands/grass";
import { DOMParser } from "xmldom";
import * as http from 'http';
import * as fs from "fs";

function createPath(week: number, arr: ContributionDay[]) {
  let txt = "";

  arr.forEach((item) => {
    txt += `\n<path style="fill:${item.color}" d="M${
      4.1 + (12 * (week + 1)) + week
    },${
      18.5 + (12 * (item.weekday + 1)) + item.weekday
    }h-8c-1.1,0-2-0.9-2-2v-8c0-1.1,0.9-2,2-2h8c1.1,0,2,0.9,2,2v8C${
      6.1 + (12 * (week + 1)) + week
    },${17.6 + (12 * (item.weekday + 1)) + item.weekday},${
      5.2 + (12 * (week + 1)) + week
    },${18.5 + (12 * (item.weekday + 1)) + item.weekday},${
      4.1 + (12 * (week + 1)) + week
    },${18.5 + (12 * (item.weekday + 1)) + item.weekday}z"/>`;
  });

  return txt;
}

function toBuffer(ab: ArrayBuffer) {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

const grassWidget = async (
  username: string,
  today: number,
  weeks: ContributionDay[][]
) => {
  const parser = new DOMParser();
  const svgText = `<?xml version="1.0" encoding="utf-8"?>
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 220 115"
    style="enable-background:new 0 0 220 115;"
    xml:space="preserve"
  >
    <g>
      <path style="fill:#FFFFFF;" d="M212,115H8c-4.4,0-8-3.6-8-8V8c0-4.4,3.6-8,8-8h204c4.4,0,8,3.6,8,8v99C220,111.4,216.4,115,212,115z"/>
      <text style="font-size:8px; font-weight: bolder; fill:#58595B;" transform="matrix(1 0 0 1 6.1306 12.5319)">${username}</text>
      <text style="font-size:8px; font-weight: bolder; fill:#58595B;" transform="matrix(1 0 0 1 170.1461 12.5321)">TODAY : ${today}</text>
      <g>${weeks.map((item, index) => createPath(index, item)).join("")}
      </g>
    </g>
  </svg>`;

  fs.writeFile('./users/leteu.svg', svgText, 'binary', (err) => {
    if(err) throw err;
    console.log(`file ${'leteu'}.svg is write complete`);
  });
  // return svgUrl;
};

export default grassWidget;
