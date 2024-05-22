import {
  createDataItemSigner,
  result,
  message,
  dryrun
} from '@permaweb/aoconnect'

import { PermissionType } from 'arconnect'
import { notificationStore } from '~/stores/notificationStore'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

let processId = 'Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg'
const { showError, showSuccess, alertMessage } = $(notificationStore())
export const taskStore = defineStore('taskStore', () => {
  let respArray = $ref([])

  const createTask = async (data: any, action: string) => {
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: action }],
        data: JSON.stringify(data)
      })
      // return messageId;
    } catch (error) {
      // alertError('messageToAo -> error:' + error)
      // return '';
    }
    await getAllTasks('GetAllTasks')
    showSuccess('Create task success')
  }

  const getAllTasks = async (communityId: string, action: string) => {
    let res
    try {
      res = await dryrun({
        process: processId,
        tags: [{ name: 'Action', value: action }],
      })
    } catch (error) {
      alertMessage('messageToAo -> error:')
      return ''
    }
    if(res.Messages[0].Data === 'null'){
        respArray = []
        return ''
    }
    let resp = res.Messages[0].Data.split(';')
    console.log("resp.length = " + resp.length)
    console.log("resp = " + resp)
    respArray = []
    for (let index = 0; index < resp.length; index++) {

      let element = JSON.parse(resp[index])
      if(element.communityId !== communityId){
        continue
      }
      console.log("builderNumber = " + element.buildNumber)
      let respData = {
        id: element.taskId,
        name: element.taskName,
        image: element.taskLogo,
        description: element.taskInfo,
          startTime: element.startTime,
          endTime: element.endTime,
          rewardTotal: element.rewardTotal,
          buildNumber: element.buildNumber,
          taskRule: element.taskRule,
        reward: element.tokenNumber + " " + element.tokenType,
        builderNum: element.buildNumber,
        status: element.isBegin,
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

  const getTaskById = async(taskId: string) => {

    console.log('respArray = ' + respArray[0].id)
      // 根据taskId获取单个任务信息
      for (let index = 0; index < respArray.length; index++) {
        const taskItem = respArray[index]
        if(taskItem.id === taskId){
            showSuccess('get task by id success')
            return taskItem
        }
      }
      return ''
  }


  const joinSpaceTask = async (taskId: string, walletAddress: string, spaceUrl: string) => {
    // TODO 1.解析 space url 获取 Twitter space 信息，2.比对头像确权
    let data = {
      taskId: taskId,
      address: walletAddress,
      brandEffect: 0,
      getPerson: 0,
      audience: 0,
      url: spaceUrl,
      score: 0
    }
    console.log(JSON.stringify(data))
    // 将解析好的数据保存进 AO，与任务 ID 相关联
    await window.arweaveWallet.connect(permissions)
    try {
      const messageId = await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: 'Action', value: "JoinSpaceTask" }],
        data: JSON.stringify(data)
      })
      return messageId
    } catch (error) {
      console.log("messageToAo -> error:", error)
      return ''
    }
  }

  return $$({ createTask, getAllTasks, joinSpaceTask, getTaskById, respArray })
})
