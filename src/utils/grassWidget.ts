import { ContributionDay } from 'src/types'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
// const __dirname = path.resolve();

function createPath(week: number, arr: ContributionDay[]) {
  return arr.reduce((acc, cur) => {
    acc += `
      <path
        style="fill:${cur.color}"
        d="
          M${4.1 + 12 * (week + 1) + week},
          ${6.5 + 12 * (cur.weekday + 1) + cur.weekday}h-8c-1.1,
          0-2-0.9-2-2v-8c0-1.1,0.9-2,2-2h8c1.1,0,2,0.9,2,
          2v8C${6.1 + 12 * (week + 1) + week},
          ${5.6 + 12 * (cur.weekday + 1) + cur.weekday},
          ${5.2 + 12 * (week + 1) + week},
          ${6.5 + 12 * (cur.weekday + 1) + cur.weekday},
          ${4.1 + 12 * (week + 1) + week},
          ${6.5 + 12 * (cur.weekday + 1) + cur.weekday}z
        "
      />`

    return acc
  }, '')
}

export async function grassWidget(username: string, weeks: ContributionDay[][]) {
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
        <path style="fill: #fff" d="M212,103H8c-4.4,0-8-3.2-8-7.2V7.2C0,3.2,3.6,0,8,0h204c4.4,0,8,3.2,8,7.2v88.7C220,99.8,216.4,103,212,103z"/>
        <g>${weeks.map((item, index) => createPath(index, item)).join('')}
        </g>
      </g>
    </svg>`

  await new Promise<void>((res, rej) => {
    if (!fs.existsSync('./users')) {
      fs.mkdirSync('./users')
    }

    fs.writeFile(`./users/${username}.svg`, svgText, 'binary', (err) => {
      if (err) {
        rej(err)
        throw err
      }

      console.log(`file ${username}.svg is write complete`)
      res()
    })
  })

  await sharp(path.resolve(path.resolve(), 'users', `${username}.svg`))
    .resize(880, 460)
    .png()
    .toFile(path.resolve(path.resolve(), 'users', `${username}.png`))
    .then(function (info: any) {
      console.log(`${username}.svg conver to ${username}.png`)
      console.log(info)
    })
    .catch(function (err: any) {
      console.log(err)
    })
}
