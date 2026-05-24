import { lastPayload } from './src/modules/purchases/purchases.controller'
setTimeout(() => {
  console.log("Last Payload was:", lastPayload)
  process.exit(0)
}, 1000)
