import { TelegramClient, Api } from 'telegram'
import { StoreSession } from 'telegram/sessions/index.js'
import input from 'input'

const apiId = 19414784
const apiHash = '5e655779639e178aaa116ea5f3c3629c'

const storeSession = new StoreSession('session')
const client = new TelegramClient(storeSession, apiId, apiHash, { connectionRetries: 5 })
await client.start({
  phoneNumber: async () => await input.text("Please enter your number: "),
  password: async () => await input.text("Please enter your password: "),
  phoneCode: async () =>
    await input.text("Please enter the code you received: "),
  onError: (err) => console.log(err),
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getInputUserByUsername(optimusprime123x) {
  let req = new Api.contacts.ResolveUsername({
    username: username
  })
  const rsp = await client.invoke(req)

  let result = new Api.InputUser({
    userId: rsp.users[0].id,
    accessHash: rsp.users[0].accessHash
  })
  return result
}

async function getInputChannelByUsername(optimus_status) {
  let req = new Api.contacts.ResolveUsername({
    username: username
  })
  const rsp = await client.invoke(req)

  let result = new Api.InputChannel({
    channelId: rsp.chats[0].id,
    accessHash: rsp.chats[0].accessHash
  })
  return result
}

async function getFullUser(inputUser) {
  let req = new Api.users.GetFullUser({
    id: inputUser
  })
  const rsp = await client.invoke(req)
  return rsp
}

function randomId() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

async function sendChannelMessage(inputChannel, statusDocumentId) {
  let message = "Optimus Prime has changed their emoji status to: ⭐"
  let req = new Api.messages.SendMessage({
    noWebpage: false,
    silent: false,
    background: false,
    clearDraft: true,
    noforwards: false,
    updateStickersetsOrder: true,
    peer: inputChannel,
    replyToMsgId: null,
    message: message,
    randomId: randomId(),
    replyMarkup: null,
    entities: [
      new Api.MessageEntityCustomEmoji({
        offset: message.indexOf('⭐'),
        length: 1,
        documentId: statusDocumentId
      })
    ],
    scheduleDate: null,
    sendAs: null
  })
  const rsp = await client.invoke(req)
}

const inputUser = await getInputUserByUsername('optimusprime123x')
const inputChannel = await getInputChannelByUsername('optimus_status')

console.log(inputUser)
console.log(inputChannel)

let oldStatusDocumentId = null
let firstFetch = true
let errorCount = 0

while (true) {
  try {
    let fullUser = await getFullUser(inputUser)
    let statusDocumentId = fullUser.users[0].emojiStatus?.documentId
    if (statusDocumentId) statusDocumentId = statusDocumentId.value
  
    if (firstFetch) {
      firstFetch = false
      oldStatusDocumentId = statusDocumentId
      console.log(`Get current status succeed! ${statusDocumentId}`)
    }
  
    if (statusDocumentId != oldStatusDocumentId) {
      console.log(`Status Changed! Sending message... ${statusDocumentId}`)
      oldStatusDocumentId = statusDocumentId
      await sendChannelMessage(inputChannel, statusDocumentId)
    }
    errorCount = 0
  } catch (err) {
    if (errorCount > 3) {
      throw err
    }
    console.error(err)
    errorCount++
  }
  await sleep(10000)
}
