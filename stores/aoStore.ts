import {
  createDataItemSigner,
  result,
  // results,
  message,
  // spawn,
  // monitor,
  // unmonitor,
  dryrun
} from '@permaweb/aoconnect'

import { PermissionType } from 'arconnect'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net', // 这是主网节点的 URL
  port: 443,
  protocol: 'https'
});


export const aoStore = defineStore('aoStore', () => {
  const tokenMap = $ref({
    CRED: 'Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc',
    AOCoin: 'rxl5oOyCuzrUUVB1edjrcHpcn9s9czhj4rsq4ACQGv4',
    Arena: '-_8-spu6PyX-yYaPwf_1owaWc7Rakhbe8TaJ0Yschig',
    DepositService: 'kzcVZhdcZOpM90eeKb-JRX3AG7TGH__S7p5I6PsqA3g'
  })
  const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'
  let address = $(lsItemRef('address', ''))
  let credBalance = $(lsItemRef('credBalance', 0))
  let aoCoinBalance = $(lsItemRef('aoCoinBalance', 0))
  const { showError } = $(notificationStore())

  const doLogin = async () => {
    await window.arweaveWallet.connect(permissions)
    try {
      address = await window.arweaveWallet.getActiveAddress()

      let result = await message({
        process: processID,
        tags: [
          { name: 'Action', value: 'registInfo' },
          { name: 'userAddress', value: address }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      await init()
    } catch (error) {
      console.error(error)
    }
  }

  const doLogout = async () => {
    await window.arweaveWallet.disconnect()
    address = ''
    credBalance = 0
    aoCoinBalance = 0
  }

  const getBalance = async (process: string) => {
    if (tokenMap[process]) {
      process = tokenMap[process]
    }
    let rz = await message({
      process,
      tags: [
        { name: 'Action', value: 'Balance' },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    try {
      rz = await result({
        message: rz,
        process,
      })
      rz = useGet(useGet(rz, 'Messages[0].Tags').find(tag => tag.name === 'Balance'), 'value', '0')
      return parseFloat(rz)
    } catch (err) {
      console.log(`====> err :`, err)
    }

    return 0
  }

  const getData = async ({ process, Action }, tagFilters) => {
    if (tokenMap[process]) {
      process = tokenMap[process]
    }
    let rz = await dryrun({
      process,
      tags: [
        { name: 'Action', value: Action },
      ],
    })
    try {
      rz = rz.Messages.filter(msg => {
        const hasMatchTag = msg.Tags.filter(tag => {
          if (tagFilters[tag.name]) {
            return tag.value == tagFilters[tag.name]
          }
          return false
        })
        return hasMatchTag.length === Object.keys(tagFilters).length
      })
      rz = JSON.parse(useGet(rz, '[0].Data'))
    } catch (err) {
      console.log(`====> err :`, err, rz)
    }

    return rz
  }

  const sendToken = async (process, recipient, amount, tags = []) => {
    if (!address) {
      await doLogin()
    }

    if (tokenMap[process]) {
      process = tokenMap[process]
    }

    if (amount <= 0) {
      showError(`amount can not be zero`)
      return false
    }

    amount = (parseFloat(amount) * 1000).toString()

    let rz = await message({
      process,
      tags: [
        ...tags,
        { name: 'Action', value: 'Transfer' },
        { name: 'Recipient', value: recipient },
        { name: 'Quantity', value: amount },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })

    try {
      rz = await result({
        message: rz,
        process,
      })
      const error = useGet(rz, 'Messages[0].Tags').find((tag: Tag) => tag.name === 'Error')
      if (error) {
        showError(error.value)
        return false
      }
      rz = useGet(rz, 'Messages[0].Tags').find((tag: Tag) => tag.name === 'Action').value
      if (rz === "Debit-Notice") {
        return true
      }
    } catch (err) {
      console.log(`====> err :`, err)
      showError(err.toString())
    }
    return false
  }

  const init = async () => {
    if (!address) return

    credBalance = (await getBalance('CRED')) / 1e3
    aoCoinBalance = (await getBalance('AOCoin')) / 1e3
  }

  const getarbalance = async () => {
    try {
      // 查询地址余额
      const balance = await arweave.wallets.getBalance(address);
      console.log('Balance (in winston):', balance);

      // 将余额从 winston 转换为 AR
      const arBalance = arweave.ar.winstonToAr(balance);
      console.log('Balance (in AR):', arBalance);
      return arBalance
    } catch (error) {
      console.log(error)
    }
  }

  return $$({ tokenMap, getData, address, credBalance, aoCoinBalance, sendToken, init, doLogout, doLogin, getarbalance })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aoStore, import.meta.hot))

