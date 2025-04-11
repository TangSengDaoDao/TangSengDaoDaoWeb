import React, { Component } from "react";
import { ReactNode } from "react";
import Section from "./section";
import ItemContacts from "./item-contacts";
import ItemGroup from "./item-group";
import ItemMessage from "./item-message";
import WKApp from "../../App";
import "./tab-all.css"
import WKSDK, { Channel, ChannelTypePerson, MessageContentType } from "wukongimjssdk";
import { MessageContentTypeConst } from "../../Service/Const";


interface TabAllProps {
    keyword?: string;
    searchResult?: any;
    loadMore?: () => void; // 添加加载更多的回调函数
    // item点击事件，传递item和type，type为contacts、group、message
    onClick?: (item: any, type: string) => void;
}

export default class TabAll extends Component<TabAllProps> {

    handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight) {
            if (this.props.loadMore) {
                this.props.loadMore();
            }
        }
    };

    render(): ReactNode {

        let existFriends = this.props.searchResult?.friends.length > 0
        let existGroups = this.props.searchResult?.groups.length > 0
        let existMessages = this.props.searchResult?.messages.length > 0

        return <div className="wk-tab-all" onScroll={this.handleScroll}>

            {
                existFriends ? (<Section title="联系人">
                    {
                        this.props.searchResult.friends.map((item: any) => {
                            return <ItemContacts
                                key={item.channel_id}
                                name={item.channel_name}
                                avatar={WKApp.shared.avatarUser(item.channel_id)}
                                onClick={() => {
                                    if (this.props.onClick) {
                                        this.props.onClick(item, "contacts")
                                    }
                                }}
                            />
                        })
                    }
                </Section>) : null
            }
            {
                existGroups ? (
                    <Section title="群组">
                        {
                            this.props.searchResult?.groups.map((item: any) => {
                                if (this.props.keyword && item.channel_name.indexOf(this.props.keyword) !== -1) {
                                    item.channel_name = item.channel_name.replace(this.props.keyword, `<mark>${this.props.keyword}</mark>`)
                                }
                                return <ItemGroup
                                    key={item.channel_id}
                                    name={item.channel_name}
                                    avatar={WKApp.shared.avatarGroup(item.channel_id)}
                                    onClick={() => {
                                        if (this.props.onClick) {
                                            this.props.onClick(item, "group")
                                        }
                                    }}
                                />
                            })
                        }
                    </Section>
                ) : null
            }

            {
                existMessages ? (
                    <Section title="消息">
                        {
                            this.props.searchResult?.messages.map((item: any) => {
                                let digest = "[未知消息]"
                                console.log("item.content--->",item.content)
                                if(item.content) {
                                    digest = item.content.conversationDigest
                                }else {
                                    if (item.payload.type === MessageContentType.text) {
                                        digest = item.payload.content
                                    } else if (item.payload.type === MessageContentTypeConst.file) {
                                        digest = `[${item.payload.name}]`
                                    }
                                }
                                

                                let sender;
                                if (item.channel.channel_type !== ChannelTypePerson && item.from_uid && item.from_uid !== "") {
                                    const senderChannel = new Channel(item.from_uid, ChannelTypePerson)
                                    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(senderChannel)
                                    if (channelInfo) {
                                        sender = channelInfo.title
                                    } else {
                                        WKSDK.shared().channelManager.fetchChannelInfo(senderChannel)
                                    }
                                }

                                return <ItemMessage 
                                key={item.message_idstr} 
                                sender={sender} 
                                digest={digest} 
                                name={item.channel.channel_name} 
                                avatar={WKApp.shared.avatarChannel(new Channel(item.channel.channel_id, item.channel.channel_type))} 
                                onClick={() => {
                                    if (this.props.onClick) {
                                        this.props.onClick(item, "message")
                                    }
                                }}
                                />
                            })
                        }
                    </Section>
                ) : null
            }


        </div>
    }
}