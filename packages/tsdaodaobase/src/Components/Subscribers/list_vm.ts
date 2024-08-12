import { Channel, Subscriber } from "wukongimjssdk";
import WKApp from "../../App";
import { ProviderListener } from "../../Service/Provider";


export class SubscriberListVM extends ProviderListener {
    channel: Channel
    subscribers: Subscriber[] = []
    currPage: number = 1
    loading: boolean = false
    limit: number = 50
    hasMore: boolean = true
    keyword: string = ""
    constructor(channel: Channel) {
        super()
        this.channel = channel
    }

    didMount(): void {
        this.delyRequestSubscribers()
    }

    search(keyword:string) {
        this.currPage = 1
        this.subscribers = []
        this.keyword = keyword
        this.requestSubscribers()
    }

    requestSubscribers = async () => {

        const subscribers = await WKApp.dataSource.channelDataSource.subscribers(this.channel, {
            page: this.currPage,
            limit: this.limit,
            keyword: this.keyword,
        })
        this.hasMore = subscribers&&subscribers.length>=this.limit
        if (subscribers) {
            if (this.currPage === 1) {
                this.subscribers = subscribers
            } else {
                this.subscribers = this.subscribers.concat(subscribers)
            }
        }
        this.notifyListener()
    }

    delyRequestSubscribers = () => {
        // 延迟执行,这样动画切换的时候就不会显的卡顿
        setTimeout(async () => {
            this.requestSubscribers()
        }, 250)
    }

    loadMoreSubscribersIfNeed = async () => {
        if (this.loading || !this.hasMore) {
            return
        }
        this.loading = true
        this.currPage++
        await this.requestSubscribers()
        this.loading = false
    }

}