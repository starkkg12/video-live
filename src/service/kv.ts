import axios from 'axios'

const instance = axios.create({})

export default () => {
  let init: string[] = []

  const api = {
    /**
     * @description 获取站点的永久域名，备用域名等
     * @param websiteId 站点ID
     */
    getWebsiteDomainList: () => {
      init.push(`wm/website/domainList/${import.meta.env.PUBLIC_WEBSITE_ID}`)
      return api
    },
    /**
     * @description 获取游戏类型
     */
    getGamePlatform: () => {
      init.push(`gr/gameType/list`)
      return api
    },
    /**
     * 根据 manageSiteId 获取游戏类型
     * @param manageSiteId 
     * @returns 
     */
    getGamePlatformWithManageSiteId: (manageSiteId: string) => {
      init.push(`gr/gameType/list/${manageSiteId}`)
      return api
    },
    /**
     *
     * @param gameType 游戏id
     * @param manageSiteId 客商id
     * @returns
     */
    getAllGamePlatform: (gameType: string, manageSiteId: string) => {
      init.push(`tk/websiteList/${manageSiteId}/${gameType}`)
      return api
    },
    /**
     * @description 获取开奖结果
     * @param gameType 游戏类型
     * @param year 年份
     * @param issue 期数
     */
    getGameResult: (gameType: string, year: string, issue: string) => {
      init.push(`gr/${gameType}/issue/${year}/${issue}`)
      return api
    },
    /**
     * @description 获取当前期开奖结果
     * @param gameType 游戏类型
     */
    getGameResultOpen: (gameType: string) => {
      init.push(`gr/${gameType}/issue/open`)
      return api
    },
    /**
     * @description 获取当前期期数
     * @param gameType 游戏类型
     */
    getGameIssueCurrentInfo: (gameType: string) => {
      init.push(`gr/${gameType}/issue/currentInfo`)
      return api
    },
    /**
     * @description 获取当前期期数
     * @param gameType 游戏类型
     */
    getGameIssueCurrent: (gameType: string) => {
      init.push(`gr/${gameType}/current`)
      return api
    },

    /**
     * @description 获取开奖历史
     * @param gameType 游戏类型
     * @param year 年份
     */
    getGameResultHistory: (gameType: string, year: string) => {
      init.push(`gr/${gameType}/history/${year}`)
      return api
    },
    /**
     * @description 获取开奖日期
     * @param gameType 游戏类型
     */
    getGameOpenTime: (gameType: string) => {
      init.push(`gr/${gameType}/openTime`)
      return api
    },
    /**
     * @description 获取下一期开奖时间
     * @param gameType 游戏类型
     */
    getGameIssueNextIssueInfo: (gameType: string) => {
      init.push(`gr/${gameType}/issue/info`)
      return api
    },
    /**
     * @description 获取通过当前网站参与的人数
     * @param gameType 游戏类型
     * @param manageSiteId 商户ID
     * @param year 年份
     * @param issue 期数
     */
    getGamePlayers: (gameType: string, manageSiteId: string, year: string, issue: string) => {
      init.push(`gr/${gameType}/players/${manageSiteId}/${year}/${issue}`)
      return api
    },
    /**
     * @description 获取网站大全列表
     * @param manageSiteId 商户ID
     */
    getWebsiteList: (manageSiteId: string) => {
      init.push(`tk/websiteList/${manageSiteId}`)
      return api
    },
    /**
     * @description 获取担保平台
     * @param manageSiteId 商户ID
     */
    getGuarantee: (manageSiteId: string) => {
      init.push(`tk/guarantee/${manageSiteId}`)
      return api
    },
    /**
     * @description 获取论坛大全
     * @param manageSiteId 商户ID
     */
    getBbsSiteList: (manageSiteId: string) => {
      init.push(`tk/bbsSiteList/${manageSiteId}`)
      return api
    },
    /**
     * @description 侧边 资料大全
     * @param manageSiteId 商户ID
     */
    getCorPusDetail: (manageSiteId: string) => {
      init.push(`bbs/${manageSiteId}/corpus/detail`)
      return api
    },
    /**
     * @description 侧边栏-幽默竞猜
     * @param manageSiteId 商户ID
     */
    getHumorousQuizDetail: (manageSiteId: string) => {
      init.push(`bbs/${manageSiteId}/guess/detail`)
      return api
    },
    /**
     * 主页-高手论坛-获取ForumId
     * @param manageSiteId 商户ID
     */
    getForumIdInfo: (manageSiteId: string) => {
      // init.push(`bbs/${manageSiteId}/expertCommunication/detail`)
      init.push(`bbs/${manageSiteId}/userPublic/detail`)
      return api
    },
    // bbs/{manageSiteId}/expertCommunication/detail
    /**
     * 侧边栏-幽默竞猜-获取帖子
     * @param manageSiteId 商户ID
     * @param forumId 论坛ID
     */
    getHumorousQuizForum: (manageSiteId: string, forumId: string) => {
      init.push(`bbs/${manageSiteId}/forum/${forumId}`)
      return api
    },
    /**
     * 侧边栏-幽默竞猜-获取帖子
     * @param manageSiteId 商户ID
     * @param postId 帖子ID
     */
    getHumorousQuizPost: (manageSiteId: string, postId: string) => {
      init.push(`bbs/${manageSiteId}/post/${postId}`)
      return api
    },
    /**
     * @description
     * 高手论坛
     * 默认60条推荐信息
     * @param {string} manageSiteId
     *  商户ID
     * @description 根据商户ID查询官方推荐的期刊列表
     * @param {string} manageSiteId 商户ID
     */
    getRecommendation: (manageSiteId: string) => {
      init.push(`bbs/${manageSiteId}/user-publish/top60`)
      return api
    },
    /**
     * @description
     * 01_查询期刊列表
     *  根据商户ID、游戏类型、期刊系列号查询期刊列表
     * @param {string} manageSiteId
     *  商户ID
     * @param {string} gameType
     *  游戏类型
     * @param {string} serialCode
     *  期刊系列号
     * @description 根据商户ID、游戏类型、期刊系列号查询期刊列表
     * @param {string} manageSiteId 商户ID
     * @param {string} gameType 游戏类型
     * @param {string} serialCode 期刊系列号
     */
    getJournalList01: (manageSiteId: string, gameType: string, serialCode: string) => {
      init.push(`tk/${manageSiteId}/${gameType}/${serialCode}`)
      return api
    },
    /**
     * @description 查询期刊列表
     * @param {string} manageSiteId 商户ID
     * @param {string} gameType 游戏类型
     * @param {string} year 年份
     * @param {string} issue 期数
     */
    getJournalList02: (manageSiteId: string, gameType: string, year: string, issue: string) => {
      init.push(`tk/${manageSiteId}/issue/${gameType}/${year}/${issue}`)
      return api
    },
    /**
     * @description 获取当前期刊
     * @param {string} manageSiteId 商户ID
     * @param {string} gameType 游戏类型
     */
    getCurrentJournal: (manageSiteId: string, gameType: string) => {
      init.push(`tk/${manageSiteId}/issue/${gameType}/current`)
      return api
    },
    /**
     * @description 获取用户发表的期刊列表
     * @param {string} manageSiteId 商户ID
     * @param {string} gameType 游戏类型
     */
    getUserPublishJournal: (manageSiteId: string, gameType: string) => {
      init.push(`tk/${manageSiteId}/issue/${gameType}/ugc`)
      return api
    },
    /**
     * @description 获取用户发表的期刊推荐列表
     * @param {string} manageSiteId 商户ID
     * @param {string} gameType 游戏类型
     */
    getUserPublishRecommend: (manageSiteId: string, gameType: string) => {
      init.push(`tk/${manageSiteId}/issue/${gameType}/ugc/recommend`)
      return api
    },
    /**
     * @description 获取最近几年的期数
     * @param {string} gameType 游戏类型
     */
    getRecentYearsIssueList: (gameType: string) => {
      init.push(`tk/${gameType}/issueList`)
      return api
    },
    /**
     * @description 获取官方推荐的期刊列表（60）条
     * @param {string} manageSiteId 商户ID
     * @param {string} gameType 游戏类型
     */
    getRecommendJournal: (manageSiteId: string, gameType: string) => {
      init.push(`tk/${manageSiteId}/issue/${gameType}/recommend`)
      return api
    },
    /**
     * @description 获取期刊列表——评论最多（60）条
     * @param {string} manageSiteId 商户ID
     * @param {string} issueld 期刊ID
     */
    getCommentJournal: (manageSiteId: string, issueld: string) => {
      init.push(`tk/${manageSiteId}/issue/${issueld}`)
      return api
    },

    /**
     * @description 获取新闻列表（六合图库）
     * @param gameType 游戏类型
     */
    getNewsPaperList: (manageSiteId: string, gameType: string) => {
      init.push(`tk/${manageSiteId}/${gameType}/newspaperList`)
      return api
    },
    /**
     * @description 获取用户信息
     * @param manageSiteId 商户ID
     * @param userId 用户ID
     */
    getUserInfo: (userId: string) => {
      init.push(`user/${import.meta.env.PUBLIC_MANAGE_SITE_ID}/profile/${userId}`)
      return api
    },
    /**
     * @description 获取网站联系方式
     */
    getWebsiteContact: () => {
      init.push(`wm/website/${import.meta.env.PUBLIC_WEBSITE_ID}`)
      return api
    },

    // 获取网站全量
    getWebsiteAll: () => {
      // wm/domain/simple/{domain}
      init.push(`wm/domain/simple/${import.meta.env.PUBLIC_WEBSITE_DOMAIN}`)
      return api
    },
    /**
     * @description 获取特定帖子列表
     * @param forumName 论坛名
     */
    getPostList: (forumName: string) => {
      init.push(`bbs/${import.meta.env.PUBLIC_MANAGE_SITE_ID}/forum/${forumName}`)
      return api
    },
    /**
     * @description 获取积分排行
     * @param type day | week | month | all
     */
    getScoreRanking: (type: string) => {
      init.push(`user/ranking/score/${type}`)
      return api
    },
    /**
     * @description 获取热度排行
     * @param type day | week | month | all
     */
    getHeatRanking: (type: string) => {
      init.push(`user/ranking/heat/${type}`)
      return api
    },
    /**
     * @description 获取粉丝排行
     * @param type day | week | month | all
     */
    getFansRanking: (type: string) => {
      init.push(`user/ranking/fans/${type}`)
      return api
    },
    /**
     * @description 获取站点信息
     */
    getDomain: (domain?: string) => {
      init.push(`wm/domain/${domain ?? import.meta.env.PUBLIC_WEBSITE_DOMAIN}`)
      return api
    },
    /**
     * @description 获取系列列表
     */
    getSerialList: (gameType: string) => {
      init.push(`tk/pw01tk01/${gameType}/serialList`)
      return api
    },
    /**
     * @description 获取所有发现帖子
     */
    getFindPostAll: () => {
      init.push(`bbs/pw01tk01/forum/myForum`)
      return api
    },
    /**
     * @description 获取发现帖子
     */
    getFindPost: (gameType: string) => {
      init.push(`bbs/pw01tk01/forum/myForum/${gameType}`)
      return api
    },
    getAvatarList: () => {
      init.push(`user/pre-avatar-list`)
      return api
    },
    do: () =>
      instance
        .get<any[]>(`${import.meta.env.PUBLIC_KV_URL}?keys=${init.join(',')}`)
        .then(res => Object.values(res.data)),
  }
  return api
}
