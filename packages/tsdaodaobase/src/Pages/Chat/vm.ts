import WKSDK, { MessageContentType } from "wukongimjssdk";
import { ChannelInfoListener } from "wukongimjssdk";
import { ConnectStatus, ConnectStatusListener } from "wukongimjssdk";
import { ConversationAction, ConversationListener } from "wukongimjssdk";
import { Channel, ChannelInfo, Conversation, Message } from "wukongimjssdk";
import WKApp, { MessageDeleteListener } from "../../App";
import { ConversationWrap } from "../../Service/Model";
import { ProviderListener } from "../../Service/Provider";
import { animateScroll, scroller } from 'react-scroll';
import { ProhibitwordsService } from "../../Service/ProhibitwordsService";
import { EndpointID } from "../../Service/Const";

export class ChatVM extends ProviderListener {
    conversations: ConversationWrap[] = new Array()
    loading: boolean = false // 最近会话是否加载中
    private _connectTitle: string = "" // 连接标题
    private _showChannelSetting: boolean = false // 是否显示频道设置
    private _selectedConversation?: ConversationWrap // 选中的最近会话
    private _showAddPopover = false // 点击添加按钮弹出的popover
    private connectStatusListener!: ConnectStatusListener
    private conversationListener!: ConversationListener
    private channelListener!: ChannelInfoListener
    private messageDeleteListener!: MessageDeleteListener
    private conversationListID = "wk-conversationlist"


    set showAddPopover(v: boolean) {
        this._showAddPopover = v
        this.notifyListener()
    }

    get showAddPopover() {
        return this._showAddPopover
    }

    set selectedConversation(v: ConversationWrap | undefined) {
        this._selectedConversation = v
        this.notifyListener()
    }

    set showChannelSetting(v: boolean) {
        this._showChannelSetting = v
        this.notifyListener()
    }

    get showChannelSetting() {
        return this._showChannelSetting
    }

    get selectedConversation() {
        return this._selectedConversation
    }

    set connectTitle(v: string) {
        this._connectTitle = v
        this.notifyListener()
    }

    get connectTitle() {
        return this._connectTitle
    }

    didMount(): void {
        // 根据连接状态设置标题
        this.setConnectTitleWithConnectStatus(WKSDK.shared().connectManager.status)

        if(WKSDK.shared().connectManager.status == ConnectStatus.Connected){ // 如果已经连接则直接加载
            this.reloadRequestConversationList()
        }

        // 监听im连接状态
        this.connectStatusListener = (status: ConnectStatus, reasonCode?: number) => {
            this.setConnectTitleWithConnectStatus(WKSDK.shared().connectManager.status)
            if (status === ConnectStatus.Connected) {
                // 请求最近会话列表
                this.reloadRequestConversationList()
            }
        }
        WKSDK.shared().connectManager.addConnectStatusListener(this.connectStatusListener)

        // ---------- 最近会话 ----------
        this.conversationListener = (conversation: Conversation, action: ConversationAction) => {

            const channelInfo = WKSDK.shared().channelManager.getChannelInfo(conversation.channel)
            if (!channelInfo) {
                WKSDK.shared().channelManager.fetchChannelInfo(conversation.channel)
            }
            if (action === ConversationAction.add) {
                console.log("ConversationAction-----add")
                if(conversation.lastMessage?.content && conversation.lastMessage?.contentType === MessageContentType.text) {
                    conversation.lastMessage.content.text = ProhibitwordsService.shared.filter(conversation.lastMessage?.content.text)
                }
                this.conversations = [new ConversationWrap(conversation), ...this.conversations]
                this.notifyListener()
            } else if (action === ConversationAction.update) {
                console.log("ConversationAction-----update")
                const existConversation = this.findConversation(conversation.channel)
                if (existConversation) {
                    existConversation.conversation = conversation
                    if(existConversation.lastMessage?.content && existConversation.lastMessage?.contentType === MessageContentType.text) {
                        existConversation.lastMessage.content.text = ProhibitwordsService.shared.filter(existConversation.lastMessage?.content.text)
                    }
                }

                this.sortConversations()
                const conversationY = this.currentConversationListY()
                console.log("conversationY----->", conversationY)
                this.notifyListener(() => {
                    if (conversationY) {
                        this.keepPosition(conversationY)
                    }
                })
            } else if (action === ConversationAction.remove) {
                this.removeConversation(conversation.channel)
            }
        }
        WKSDK.shared().conversationManager.addConversationListener(this.conversationListener)

        this.channelListener = (channelInfo: ChannelInfo) => {
            const conversation = this.findConversation(channelInfo.channel)
            if (conversation) {
                conversation.extra.top = channelInfo.top ? 1 : 0
                this.sortConversations()
                this.notifyListener()
            }
        }
        WKSDK.shared().channelManager.addListener(this.channelListener)

        this.messageDeleteListener = (message: Message, preMessage?: Message) => {
            const conversation = WKSDK.shared().conversationManager.findConversation(message.channel)
            if (conversation) {
                if (conversation.lastMessage && conversation.lastMessage.clientMsgNo === message.clientMsgNo) {
                    conversation.lastMessage = preMessage
                    WKSDK.shared().conversationManager.notifyConversationListeners(conversation, ConversationAction.update)
                }
            }
        }
        WKApp.shared.addMessageDeleteListener(this.messageDeleteListener)


    }
    didUnMount(): void {
        WKSDK.shared().connectManager.removeConnectStatusListener(this.connectStatusListener)
        WKSDK.shared().conversationManager.removeConversationListener(this.conversationListener)
        WKSDK.shared().channelManager.removeListener(this.channelListener)
        WKApp.shared.removeMessageDeleteListener(this.messageDeleteListener)
    }

    findConversation(channel: Channel) {
        if (this.conversations) {
            for (const conversation of this.conversations) {
                if (conversation.channel.isEqual(channel)) {
                    return conversation
                }
            }
        }
    }

    keepPosition(y: number) {
        animateScroll.scrollTo(y, {
            containerId: this.conversationListID,
            "duration": 0,
        })
    }
    currentConversationListY() {
        const conversationElem = document.getElementById(this.conversationListID)
        if (!conversationElem) {
            return
        }
        return conversationElem.scrollTop
    }

    removeConversation(channel: Channel) {
        if (this.conversations) {
            for (let i = 0; i < this.conversations.length; i++) {
                const conversation = this.conversations[i]
                if (conversation.channel.isEqual(channel)) {
                    this.conversations.splice(i, 1)
                    this.notifyListener()
                    break
                }
            }
        }
    }

      async clearMessages(channel: Channel) {
    
        const conversationWrap = this.findConversation(channel)
        if (!conversationWrap) {
          return
        }
        await WKApp.conversationProvider.clearConversationMessages(conversationWrap.conversation)
        conversationWrap.conversation.lastMessage = undefined
        conversationWrap.conversation.unread = 0
        WKApp.endpointManager.invoke(EndpointID.clearChannelMessages, channel)
        this.sortConversations()
        this.notifyListener()
      }


    setConnectTitleWithConnectStatus(connectStatus: ConnectStatus) {
        if (connectStatus === ConnectStatus.Connected) {
            this.connectTitle = WKApp.config.appName
        } else if (connectStatus === ConnectStatus.Disconnect) {
            this.connectTitle = "已断开"
        } else {
            this.connectTitle = "连接中..."
        }
    }

    // 排序最近会话列表
    sortConversations(conversations?: Array<ConversationWrap>) {
        let newConversations = conversations;
        if (!newConversations) {
            newConversations = this.conversations
        }
        if (!newConversations || newConversations.length <= 0) {
            return [];
        }
        let sortAfter = newConversations.sort((a, b) => {
            let aScore = a.timestamp;
            let bScore = b.timestamp;
            if (a.extra?.top === 1) {
                aScore += 1000000000000;
            }
            if (b.extra?.top === 1) {
                bScore += 1000000000000;
            }
            return bScore - aScore;
        });
        return sortAfter
    }

    async requestConversationList() {

        this.loading = true
        this.notifyListener()
        const conversationWraps = new Array<ConversationWrap>()
        const conversations = await WKSDK.shared().conversationManager.sync({})
        if (conversations && conversations.length > 0) {
            for (const conversation of conversations) {
                conversationWraps.push(new ConversationWrap(conversation))
            }
        }
        this.conversations = conversationWraps
        this.loading = false

        this.sortConversations()

        this.notifyListener()
    }

    async reloadRequestConversationList() {
        const conversationWraps = new Array<ConversationWrap>()
        const conversations = await WKSDK.shared().conversationManager.sync({})
        if (conversations && conversations.length > 0) {
            for (const conversation of conversations) {
                if(conversation.lastMessage?.content && conversation.lastMessage?.contentType == MessageContentType.text) {
                    if (conversation.lastMessage.content.text) {
                        conversation.lastMessage.content.text = ProhibitwordsService.shared.filter(conversation.lastMessage.content.text )
                    }
                }
                conversationWraps.push(new ConversationWrap(conversation))
            }
        }
        this.conversations = conversationWraps
        this.sortConversations()

        this.notifyListener()

        WKApp.menus.refresh()
    }
}