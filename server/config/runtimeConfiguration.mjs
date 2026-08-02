import { chromium } from 'playwright-core'
import './loadEnvironment.mjs'

export const runtimeConfiguration = {
  port: Number(process.env.PORT || 4174),
  visionModel: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna',
  myNetDiaryExportUrl: 'https://www.mynetdiary.com/analysisNavigator.do?selectedItem=dataExport',
  myNetDiaryPasswordService: 'com.ithacus.nourish.mynetdiary',
  myNetDiaryEmailService: 'com.ithacus.nourish.mynetdiary.email',
  headlessBrowserPath: chromium.executablePath().replace(/\/chromium-(\d+)\/.*$/, '/chromium_headless_shell-$1/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
}
