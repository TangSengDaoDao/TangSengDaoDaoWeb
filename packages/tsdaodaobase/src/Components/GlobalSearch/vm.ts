import WKSDK, { Channel, ChannelInfo, ChannelInfoListener, ChannelTypePerson, MessageContentManager, SystemContent } from "wukongimjssdk";
import APIClient from "../../Service/APIClient";
import { MessageContentTypeConst } from "../../Service/Const";
import { ProviderListener } from "../../Service/Provider";

export default class GlobalSearchVM extends ProviderListener {
    // 选中的tab组件
    private _selectedTabKey = "all";

    public page = 1 // 当前页码
    public limit = 20 // 每页条数
    public keyword = "" // 搜索关键字
    public searchResult: any
    public isComposing: boolean = false; // 是否正在输入(防止中文输入法干扰)
    public loadMoreing = false; // 是否正在加载更多中
    public loadFinish = false; // 是否加载完成
    public contentTypes = new Array<number>() // 内容类型
    private channelInfoListener!: ChannelInfoListener;
    public channel?: Channel // 查询指定频道的消息
    // tab数据列表
    public get tabList() {
        if (this.searchInChannel) {
            return [
                { tab: '聊天', itemKey: 'all' },
                { tab: '文件', itemKey: 'files' },
            ];
        }
        return [
            { tab: '聊天', itemKey: 'all' },
            { tab: '联系人', itemKey: 'contacts' },
            { tab: '群组', itemKey: 'groups' },
            { tab: '文件', itemKey: 'files' },
        ];
    }

    public get selectedTabKey() {
        return this._selectedTabKey;
    }

    public set selectedTabKey(value: string) {
        this._selectedTabKey = value;
        this.notifyListener()
    }

    // 是否在频道内搜索
    public get searchInChannel(): boolean {
        return this.channel !== undefined
    }
    // 搜索标题
    public get searchTitle() {
        if (this.searchInChannel) {
            const channelInfo = WKSDK.shared().channelManager.getChannelInfo(this.channel!)
            if(channelInfo) {
                return `与“${channelInfo.title}”的聊天记录`
            }
            return ""
        }
        return undefined
    }

    // tab选中事件
    public onTabClick(key: string) {
        if (key === "files") {
            this.contentTypes = [MessageContentTypeConst.file]
            this.initLoad()
            this.requestSearch()
        } else {
            this.contentTypes = []
            this.initLoad()
            this.requestSearch()
        }
        this.selectedTabKey = key;
    }

    didMount(): void {
        this.requestSearch()

        this.channelInfoListener = (channelInfo: ChannelInfo) => {
            if (channelInfo.channel.channelType !== ChannelTypePerson) {
                return
            }
            if (this.searchResult?.messages && this.searchResult.messages.length > 0) {
                this.searchResult.messages.forEach((item: any) => {
                    if (item.from_uid === channelInfo.channel.channelID) {
                        this.notifyListener()
                        return
                    }
                })
            }
        }

        WKSDK.shared().channelManager.addListener(this.channelInfoListener)
    }

    didUnMount(): void {
        WKSDK.shared().channelManager.removeListener(this.channelInfoListener)
    }

    // 输入框输入事件
    public handleInputChange = (value: string) => {
        if (!this.isComposing) {
            this.keyword = value;
            console.log(this.keyword);
            this.initLoad()
            this.requestSearch();
        }
    };

    public initLoad() {
        this.page = 1
        this.loadFinish = false
        this.loadMoreing = false
        this.searchResult = null
        this.notifyListener()
    }

    // 请求搜索
    public requestSearch() {

        const param: any = {
            keyword: this.keyword || "",
            page: this.page,
            limit: this.limit,
            content_type: this.contentTypes
        }


        if (this.channel) {
            param.channel_id = this.channel.channelID
            param.channel_type = this.channel.channelType
            param.only_message = 1
        }

        console.log("requestSearch", param);


        APIClient.shared.post("/search/global", param).then(res => {

            if (res.messages.length < this.limit) {
                this.loadFinish = true
            }
            if (this.loadMoreing) {
                if (this.searchResult) {
                    this.searchResult.messages = this.searchResult.messages?.concat(res.messages)
                } else {
                    this.searchResult = res
                }

            } else {
                this.searchResult = res
            }

            // 替换备注如果有备注的话
            this.searchResult.friends?.forEach((v: any) => {
                if (v.channel_remark && v.channel_remark !== "") {
                    v.channel_name = v.channel_remark
                }
            })
            this.searchResult.groups?.forEach((v: any) => {
                if (v.channel_remark && v.channel_remark !== "") {
                    v.channel_name = v.channel_remark
                }
            })
            this.searchResult.messages?.forEach((v: any) => {
                if (v.channel.channel_remark && v.channel.channel_remark !== "") {
                    v.channel.channel_name = v.channel.channel_remark
                }

                // 解析消息内容
                if(v.payload) {
                    const contentType = v.payload.type

                    const messageContent = MessageContentManager.shared().getMessageContent(contentType)
                    if (messageContent) {
                        messageContent.decode(this.jsonToUint8Array(v.payload))
                    }
                    
                    if(messageContent instanceof SystemContent) {
                        messageContent.content["content"] = "[系统消息]"
                    }
                    
                    v.content = messageContent
                }
               
            })
        }).finally(() => {
            this.loadMoreing = false
            this.notifyListener()
        })
    }

    jsonToUint8Array(json: any): Uint8Array {
        // 将 JSON 对象转换为字符串
        const jsonString = JSON.stringify(json);

       return this.stringToUint8Array(jsonString)
    }

     stringToUint8Array(str: string): Uint8Array {
        const newStr = unescape(encodeURIComponent(str))
        const arr = new Array<number>();
        for (let i = 0, j = newStr.length; i < j; ++i) {
            arr.push(newStr.charCodeAt(i));
        }
        const tmpUint8Array = new Uint8Array(arr);
        return tmpUint8Array
    }

    // 加载更多消息
    loadMore() {
        if (this.loadMoreing) {
            return
        }
        this.loadMoreing = true
        this.page++
        this.requestSearch()
        console.log("加载更多");
    }
}