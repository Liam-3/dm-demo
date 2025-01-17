import {
  createDataItemSigner,
  result,
  results,
  message,
  spawn,
  monitor,
  unmonitor,
  dryrun
} from '@permaweb/aoconnect'

import fs from 'fs'


// Read the Lua file
//const luaCode = fs.readFileSync('./AO/chat.lua', 'utf8')

export const aocommunityStore = defineStore('aocommunityStore', () => {
  const { address } = $(aoStore())
  const processID = 'jl0nyTKNDHPVMoE3DlaHiBnn8Ltoz-x0zJ2Qytag9qU'
  let communityList = $ref({})
  let userInfo = $ref({})
  let joincommunityList = $ref({})
  let isLoading = $ref(false)
  let currentUuid = $ref('')
  let communityCreate = $ref(false)

  //设置当前选中社区的uuid
  const setCurrentuuid = (uuid: any) => {
    currentUuid = uuid
  }

  //User registration method
  const registInfo = async () => {
    if (isLoading) return
    isLoading = true

    let result = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'registInfo' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    });
    isLoading = false
  }
  //Creating a community approach
  const addCommunity = async (
    logo,
    Banner,
    Name,
    Inbro,
    Website,
    ShowWebsite,
    Twitter,
    ShowTwitter,
    Whitebook,
    ShowWhitebook,
    Github,
    ShowGithub,
    ShowBuildnum,
    ShowAllreward,
    Bounty,
    ShowBounty,
    ShowDetail,
    Ispublished,
    CommunityToken,
    IsTradable,
    Support,
    ShowAlltoken,
    AllToken,
    TokenSupply,
    CommunityChatid
  ) => {
    if (isLoading) return
    isLoading = true
    const time = Date.now();
    const uuid = createuuid()

    let communitySubmitList = [
      {
        "logo": logo,
        "banner": Banner,
        "name": Name,
        "desc": Inbro,
        "creater": address,
        "owner": address,
        "website": Website,
        "showwebsite": ShowWebsite,
        "twitter": Twitter,
        "showtwitter": ShowTwitter,
        "whitebook": Whitebook,
        "showwhitebook": ShowWhitebook,
        "github": Github,
        "showgithub": ShowGithub,
        "buildnum": 0,
        "showbuildnum": ShowBuildnum,
        "showallreward": ShowAllreward,
        "bounty": Bounty,
        "showbounty": ShowBounty,
        "showdetail": ShowDetail,
        "ispublished": Ispublished,
        "communitytoken": CommunityToken,
        "istradable": IsTradable,
        "support": Support,
        "showalltoken": ShowAlltoken,
        "alltoken": AllToken,
        "tokensupply": TokenSupply,
        "uuid": uuid,
        "timestamp": time.toString(),
        "communitychatid": CommunityChatid,
      }
    ]
    const jsonString = JSON.stringify(communitySubmitList);
    const invite = "none"
    let createCommunity = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'add' },
        { name: 'userAddress', value: address },
        { name: 'time', value: time.toString() },
        { name: 'invite', value: invite }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    });
    isLoading = false
  }

  //Modifying the community approach
  const settingCommunity = async (
    Creater,
    Owner,
    logo,
    Banner,
    Name,
    Inbro,
    Website,
    ShowWebsite,
    Twitter,
    ShowTwitter,
    Whitebook,
    ShowWhitebook,
    Github,
    ShowGithub,
    Buildnum,
    ShowBuildnum,
    ShowAllreward,
    Bounty,
    ShowBounty,
    ShowDetail,
    Ispublished,
    CommunityToken,
    IsTradable,
    Support,
    ShowAlltoken,
    AllToken,
    TokenSupply,
    CommunityChatid,
    TimeStamp
  ) => {
    if (isLoading) return
    isLoading = true

    const uuid = createuuid()

    let communitySubmitList = [
      {
        "logo": logo,
        "banner": Banner,
        "name": Name,
        "desc": Inbro,
        "creater": Creater,
        "owner": Owner,
        "website": Website,
        "showwebsite": ShowWebsite,
        "twitter": Twitter,
        "showtwitter": ShowTwitter,
        "whitebook": Whitebook,
        "showwhitebook": ShowWhitebook,
        "github": Github,
        "showgithub": ShowGithub,
        "buildnum": Buildnum,
        "showbuildnum": ShowBuildnum,
        "showallreward": ShowAllreward,
        "bounty": Bounty,
        "showbounty": ShowBounty,
        "showdetail": ShowDetail,
        "ispublished": Ispublished,
        "communitytoken": CommunityToken,
        "istradable": IsTradable,
        "support": Support,
        "showalltoken": ShowAlltoken,
        "alltoken": AllToken,
        "tokensupply": TokenSupply,
        "uuid": currentUuid,
        "timestamp": TimeStamp,
        "communitychatid": CommunityChatid
      }
    ]
    const jsonString = JSON.stringify(communitySubmitList);
    let settingCommunity = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'communitysetting' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    });
    isLoading = false
  }

  //Get community list method (which generates a community table, and a joined community table)
  const getCommunitylist = async () => {
    //if (isLoading) return
    //isLoading = true
    if (address !== '') {
      let result = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'communitylist' },
          { name: 'userAddress', value: address }
        ],
      });
      const jsonData = result.Messages[0].Data;
      communityList = JSON.parse(jsonData); // Parse the main JSON data

      // Iterate through each object and parse nested JSON strings
      communityList = communityList.map((item) => {
        if (item.communitytoken && typeof item.communitytoken === 'string') {
          try {
            item.communitytoken = JSON.parse(item.communitytoken);
          } catch (e) {
            console.error('Failed to parse communitytoken:', e, item.communitytoken);
          }
        }
        return item;
      });

      joincommunityList = communityList.filter((item) => item.isJoined === true);
      isLoading = false
      return result
    } else {
      let result = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'communitylist' }
        ],
      });
      const jsonData = result.Messages[0].Data // 获取原始的 JSON 字符串
      const jsonObjects = jsonData.match(/\{.*?\}/g) // 使用正则表达式匹配字符串中的 JSON 对象
      communityList = jsonObjects.map((item: any) => JSON.parse(item)) // 解析每个 JSON 对象并存储到数组中
      joincommunityList = jsonObjects
        .map((item: any) => JSON.parse(item))
        .filter((item: any) => item.isJoined === true);
      isLoading = false
      return result
    }
  }

  //Get joined users in a given community
  const getCommunityuser = async (uuid: any) => {
    if (isLoading) return
    isLoading = true
    let result = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'communityuser' },
        { name: 'uuid', value: uuid }
      ],
    });
    isLoading = false
    return result
  }

  //Get a list of communities you've joined
  const getCommunityjoined = async () => {
    if (isLoading) return
    isLoading = true

    let result = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'communitylistjoined' },
        { name: 'userAddress', value: address }
      ],
    })
    isLoading = false
    return result
  }

  //Getting information about a specific community from a cached community list
  const getLocalcommunityInfo = async (uuid: any) => {
    //if (isLoading) return
    //isLoading = true

    const communityInfo = communityList.find(community => community.uuid === uuid);
    return communityInfo
  }

  //Getting information about a specific community
  const getCommunityInfo = async (uuid: any) => {
    if (isLoading) return
    isLoading = true

    let result = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'communityInfo' },
        { name: 'uuid', value: uuid }
      ]
    })
    isLoading = false
    return result
  }

  //How to join the community
  const joinCommunity = async (uuid, invite) => {
    if (isLoading) return
    isLoading = true
    const time = Date.now();
    let join = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'join' },
        { name: 'userAddress', value: address },
        { name: 'invite', value: invite },
        { name: 'time', value: time.toString() }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    });
    isLoading = false
    return join
  }

  //Methods of withdrawing from the community
  const exitCommunity = async (uuid) => {
    if (isLoading) return
    isLoading = true

    let exit = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'exit' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    });
    isLoading = false
    return exit
  }

  //Modification of personal information
  const personalInfo = async (avatar, username, twitter, showtwitter, mail, showmail, phone, showphone) => {
    //if (isLoading) return
    //isLoading = true
    let personal = [
      {
        "avatar": avatar,
        "name": username,
        "twitter": twitter,
        "showtwitter": showtwitter,
        "mail": mail,
        "showmail": showmail,
        "phone": phone,
        "showphone": showphone,
      }
    ]
    const jsonString = JSON.stringify(personal);
    let Info = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'personalInfo' },
        { name: 'userAddress', value: address }
      ],
      data: jsonString,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
    return Info
  }

  //Obtaining Personal Information
  const getInfo = async () => {
    if (isLoading) return
    isLoading = true
    let Info = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'getInfo' },
        { name: 'userAddress', value: address }
      ]
    })
    // Check if you have successfully obtained the Info
    const jsonData = Info.Messages[0].Data;
    const jsonObjects = jsonData.match(/\{.*?\}/g);
    const infoJson = jsonObjects.map(item => JSON.parse(item));
    userInfo = infoJson

    isLoading = false
    return Info
  }

  //Create a community chat room
  const makecommunityChat = async () => {
    let processId2 = await spawn({
      module: '5l00H2S0RuPYe-V5GAI-1RgQEHFInSMr20E-3RNXJ_U',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: createDataItemSigner(window.arweaveWallet),
    })

    const luaCode = 'Handlers.add(    "inboxCount",    Handlers.utils.hasMatchingTag("Action", "#Inbox"),    function (msg)      local inboxCount = #Inbox      ao.send({      Target = msg.From,      Tags = {      InboxCount = tostring(inboxCount)      }      })      Handlers.utils.reply("Echo back")(msg)    end  )      Handlers.add(    "inboxMessage",    Handlers.utils.hasMatchingTag("Action", "CheckInbox"),    function (msg)      local index = tonumber(msg.Tags.Index)      if index and index > 0 and index <= #Inbox then      local message = Inbox[index]      ao.send({      Target = msg.From,      Tags = {      Action = "Inbox",      Index = tostring(index),      MessageDetails = message      }      }) else      ao.send({      Target = msg.From,      Tags = {      Error = "Invalid inbox message index"      }      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'

    let buildLua = await message({
      process: processId2,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    return processId2
  }
  return $$({
    userInfo,
    communityList,
    joincommunityList,
    communityCreate,
    currentUuid,
    setCurrentuuid,
    makecommunityChat,
    registInfo,
    getLocalcommunityInfo,
    getCommunitylist,
    addCommunity,
    settingCommunity,
    joinCommunity,
    exitCommunity,
    personalInfo,
    getInfo,
    getCommunityuser,
    getCommunityjoined,
    getCommunityInfo
  })
})



if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aocommunityStore, import.meta.hot))
