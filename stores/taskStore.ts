import {
  createDataItemSigner,
  result,
  message,
  dryrun, spawn
} from '@permaweb/aoconnect'

import { PermissionType } from 'arconnect'


const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

let processId = '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw'

export const taskStore = defineStore('taskStore', () => {
  const tokenMap = $ref({
    CRED: 'Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc',
    AOCoin: 'rxl5oOyCuzrUUVB1edjrcHpcn9s9czhj4rsq4ACQGv4',
    AR: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    FIZI: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
    LINUX: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
    Arena: '-_8-spu6PyX-yYaPwf_1owaWc7Rakhbe8TaJ0Yschig',
    DepositService: 'kzcVZhdcZOpM90eeKb-JRX3AG7TGH__S7p5I6PsqA3g',
    BRKTST: '8p7ApPZxC_37M06QHVejCQrKsHbcJEerd3jWNkDUWPQ',
    TRUNK: 'OT9qTE2467gcozb2g8R6D6N3nQS94ENcaAIJfUzHCww',
    EXP: 'aYrCboXVSl1AXL9gPFe3tfRxRf0ZmkOXH65mKT0HHZw',
    ORBT: 'BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc',
    EARTH: 'PBg5TSJPQp9xgXGfjN27GA28Mg5bQmNEdXH2TXY4t-A',
    FIRE: 'KmGmJieqSRJpbW6JJUFQrH3sQPEG9F6DQETlXNt4GpM',
    AIR: '2nfFJb8LIA69gwuLNcFQezSuw4CXPE4--U-j-7cxKOU',
    FIREEARTH: 'NkXX3uZ4oGkQ3DPAWtjLb2sTA-yxmZKdlOlEHqMfWLQ',
  })

  const { showError, showSuccess, alertMessage } = $(notificationStore())
  let respArray = $ref([])

  const createTask = async (data: any) => {
    //  创建process 将process ID添加在任务信息中
    await window.arweaveWallet.connect(permissions)
    let newProcessId = await spawn({
      module: '5l00H2S0RuPYe-V5GAI-1RgQEHFInSMr20E-3RNXJ_U',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: createDataItemSigner(window.arweaveWallet),
    })
    data.processId = newProcessId
    console.log(JSON.stringify(data))
    console.log('newProcessId = ' + newProcessId)
    // 把此次任务需要的钱转给process两种bounty，转两次，如果不为0的话
    if(data.tokenNumber && data.tokenNumber != 0){
      console.log(data.tokenNumber)
      console.log(data.tokenType)
      console.log(tokenMap[data.tokenType])
      await window.arweaveWallet.connect(permissions)
      try{
        const messageId = await message({
          process: tokenMap[data.tokenType],
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            {name: 'Recipient', value: newProcessId},
            {name: 'Quantity', value: data.tokenNumber}
          ]
        })
      }catch(error){
        console.log(error)
      }
    }

    if(data.tokenNumber1 && data.tokenNumber1 != 0){
      console.log(data.tokenNumber1)
      console.log(data.tokenType1)
      await window.arweaveWallet.connect(permissions)
      try{
        const messageId = await message({
          process: tokenMap[data.tokenType1],
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            {name: 'Recipient', value: newProcessId},
            {name: 'Quantity', value: data.tokenNumber1 }
          ]
        })
      }catch(error){
        console.log(error)
      }
    }
    // 向新的process里写入sendBounty方法
    const x = 'TaskOwnerWallet = "' + newProcessId + '"'
    const luaCode = x + '      Handlers.add(    "sendBounty",    Handlers.utils.hasMatchingTag("Action", "sendBounty"),    function (msg)      if(msg.From ~= TaskOwnerWallet) then      Handlers.utils.reply("notMatch")(msg)      end      local req = json.decode(msg.Data)      for _, value in pairs(req) do      ao.send({      Target = value.tokenType,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = tostring(value.tokenNumber)      })      end      for _, value in pairs(req) do      ao.send({      Target = value.tokenType1,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = tostring(value.tokenNumber1)      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'
    const luaCode1 = 'Handlers.add(    "inboxCount",    Handlers.utils.hasMatchingTag("Action", "#Inbox"),    function (msg)      local req = json.decode(msg.Data)      for _, value in pairs(req) do      ao.send({      Target = value.tokenType,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = value.tokenNumber      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'
    let buildLua = await message({
      // process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
      process: newProcessId,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })

    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'CreateTask' }],
        data: JSON.stringify(data)
      })
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
    showSuccess('Create task success')
  }

  const getAllTasks = async (communityId: string) => {
    let res
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: 'GetAllTasks' }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
    if (res.Messages[0].Data === 'null') {
      respArray = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
    respArray = []
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])
      // console.log('communityId = ' + element.communityId)
      // console.log('trans communityId = ' + communityId)
      if (element.communityId !== communityId) {
        // console.log('communityId = ' + element.communityId)
        continue
      }
      const respData = {
        id: element.taskId,
        name: element.taskName,
        image: element.taskLogo,
        description: element.taskInfo,
        startTime: element.startTime,
        endTime: element.endTime,
        zone: element.zone,
        rewardTotal: element.rewardTotal,
        buildNumber: element.buildNumber,
        taskRule: element.taskRule,
        reward: element.tokenNumber + ' ' + element.tokenType + '+' + element.tokenNumber1 + ' ' + element.tokenType1,
        tokenNumber: element.tokenNumber,
        tokenType: element.tokenType,
        tokenNumber1: element.tokenNumber1,
        tokenType1: element.tokenType1,
        builderNum: element.buildNumber,
        status: element.isBegin,
        joined: element.joined,
        ownerId: element.ownerId,
        communityId: element.communityId,
        isBegin: element.isBegin,
        isSettle: element.isSettle,
        isCal: element.isCal,
        processId: element.processId
      }
      respArray.push(respData)

    }
    // console.log("respArray = " + respArray)
    // for (let index = 0; index < respArray.length; index++) {
    //     const e = respArray[index];
    //     console.log(e.id)
    // }
    showSuccess('Get all tasks success')
  }

  const getTaskById = async (taskId: string) => {
    // 根据taskId获取单个任务信息
    for (let index = 0; index < respArray.length; index++) {
      const taskItem = respArray[index]
      if (taskItem.id === taskId) {
        showSuccess('get task by id success')
        return taskItem
      }
    }
    return ''
  }

  const joinTask = async (taskId: string, joinedAddress: string) => {
    let data = {
      taskId: taskId,
      joinedAddress: joinedAddress
    }
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: "JoinTask" }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return ''
    }
  }

  const getTaskJoinRecord = async (taskId: string) => {
    let res
    let TaskJoinRecords = []
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: "getTaskJoinRecord" }, { name: 'taskId', value: taskId }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
    if (res.Messages[0].Data === 'null') {
      TaskJoinRecords = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])

      const respData = {
        taskId: element.taskId,
        joinedAddress: element.joinedAddress
      }
      TaskJoinRecords.push(respData)
    }
    return TaskJoinRecords
  }

  const testCallJava = async(spaceId: string) => {
    const query = computed(() => ({ spaceId: spaceId}))
    const {data} = useFetch('/api/twitter', {query})
    // space开始时间 从开始时间往前推24小时，统计邀请数量 记作friend参数
    const spaceStartedAt = data._rawValue.data.started_at
    // space参与人数
    const participanted = data._rawValue.data.participant_count
    // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
    const userAvatar = data._rawValue.includes.users[0].profile_image_url
    // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
    const userCreatedAt = data._rawValue.includes.users[0].created_at
    console.log(spaceStartedAt)
    console.log(participanted)
    console.log(userAvatar)
    console.log(userCreatedAt)

  }
  const testTransfer = async() => {
    await window.arweaveWallet.connect(permissions)
    try{
      const messageId = await message({
        process: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [
          { name: 'Action', value: 'Transfer' },
          {name: 'Recipient', value: 'AWdD90gYRc6C76x4yC4CZHJS7Ts_jakzL7b_nirgw1c'},
          {name: 'Quantity', value: '1000'}
        ]
      })
    }catch(error){
      console.log(error)
    }
  }



  const submitSpaceTask = async (taskId: string, walletAddress: string, spaceUrl: string, brand: string, friend: string, audi: string) => {
    console.log('audi = ' + audi)
    let data = {
      taskId: taskId,
      address: walletAddress,
      brandEffect: brand,
      getPerson: friend,
      audience: audi,
      url: spaceUrl,
      score: 0,
      bounty: 0
    }
    // 将解析好的数据保存进 AO，与任务 ID 相关联
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: "SubmitSpaceTask" }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return ''
    }
  }
  const updateTaskAfterCal = async (taskId: string) => {
    // 计算之后将任务信息中的是否已计算修改为Y
    console.log('in updataTask')
    try {
      await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'updateTaskAfterCal' }],
        data: taskId
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }
  }
  const updateTaskSubmitInfoAfterCal = async (taskId: string, data: any) => {
    // 计算之后将任务信息中的是否已计算修改为Y
    console.log(JSON.stringify(data))
    let requestBody = ''
    for(let i = 0; i < data.length; ++i){
      requestBody += JSON.stringify(data[i])
      if(i != data.length - 1){
        requestBody += ';'
      }
    }
    console.log(requestBody)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'updateTaskSubmitInfoAfterCal' }, { name: 'taskId', value: taskId }],
        data: requestBody
      })
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
  }
  const getSpaceTaskSubmitInfo = async (taskId: string) => {
    let res
    let spaceTaskSubmitInfo = []
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: "getSpaceTaskSubmitInfo" }, { name: 'taskId', value: taskId }],
      })
    } catch (error) {
      alertMessage(error)
      return ''
    }

    if (res.Messages[0].Data === 'null') {
      spaceTaskSubmitInfo = []
      return ''
    }
    let resp = res.Messages[0].Data.split(';')

    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])
      console.log('resp = ' + element.address)
      const respData = {
        taskId: element.taskId,
        id: index + 1,
        address: element.address,
        brandEffect: element.brandEffect,
        getPerson: element.getPerson,
        audience: element.audience,
        url: element.url,
        score: element.score,
        bounty: element.bounty,
        bounty1: element.bounty1,
        bountyType1: element.bountyType1,
        bounty2: element.bounty2,
        bountyType2: element.bountyType2
      }
      spaceTaskSubmitInfo.push(respData)
    }
    return spaceTaskSubmitInfo
  }

  // wallets: 需要转账的钱包地址 tokenNumber: 每个账户需要转的token数量 tokenType: 转账的token类型的地址
  const sendBounty = async (taskProcessId: string, bounties: any) => {
    for(let i = 0; i < bounties.length; ++i){
      if(bounties[i].tokenType){
        bounties[i].tokenType = tokenMap[bounties[i].tokenType]
      }
      if(bounties[i].tokenType1){
        bounties[i].tokenType1 = tokenMap[bounties[i].tokenType1]
      }
    }
    console.log('after token map = ' + JSON.stringify(bounties))
    console.log('taskProcessId = ' + taskProcessId)
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: taskProcessId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: 'sendBounty' }],
        data: JSON.stringify(bounties)
      })
      console.log('return message = ' + messageId)
      return messageId
    } catch (error) {
      console.log('messageToAo -> error:', error)
      return ''
    }
  }

  const makecommunityChat = async (taskProcessId: string) => {
    const x = 'TaskOwnerWallet = "' + taskProcessId + '"'
    // const luaCode  = 'Handlers.add(    "Echo",    Handlers.utils.hasMatchingTag("Action", "Echo"),    function (msg)      Handlers.utils.reply("Echo back")(msg)    end  )'
    const luaCode = x + '      Handlers.add(    "sendBounty",    Handlers.utils.hasMatchingTag("Action", "sendBounty"),    function (msg)      if(msg.From ~= TaskOwnerWallet) then      Handlers.utils.reply("notMatch")(msg)      end      local req = json.decode(msg.Data)      for _, value in pairs(req) do      ao.send({      Target = value.tokenType,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = tostring(value.tokenNumber)      })      end      for _, value in pairs(req) do      ao.send({      Target = value.tokenType1,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = tostring(value.tokenNumber1)      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'

    console.log(luaCode)
    const luaCode1 = 'Handlers.add(    "inboxCount",    Handlers.utils.hasMatchingTag("Action", "#Inbox"),    function (msg)      local req = json.decode(msg.Data)      for _, value in pairs(req) do      ao.send({      Target = value.tokenType,      Action = "Transfer",      Recipient = value.walletAddress,      Quantity = value.tokenNumber      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'
    let buildLua = await message({
      // process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
      process: '4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw',
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })

    // const testBuild = await message({
    //   process: 'Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I',
    //   tags: [
    //     { name: 'Action', value: 'Echo' }
    //   ],
    //   signer: createDataItemSigner(window.arweaveWallet),
    // })
    // console.log(JSON.stringify(testBuild))
  }

  return $$({ updateTaskSubmitInfoAfterCal, updateTaskAfterCal, testTransfer, testCallJava, createTask, getAllTasks, submitSpaceTask, getTaskById, respArray, sendBounty, joinTask, getTaskJoinRecord, getSpaceTaskSubmitInfo, makecommunityChat })
})

// Send({ Target = ao.id, Action = "sendBounty", Data = "{"tokenNumber": "100","tokenType": "4JDIOsjRpAhOdI7P1olLJLmLc090DlxbEQ5xZLZ7NJw","wallets": ["Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg","jl0nyTKNDHPVMoE3DlaHiBnn8Ltoz-x0zJ2Qytag9qU"]}"})
