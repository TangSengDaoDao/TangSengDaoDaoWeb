import React, { Component } from "react";
import { ReactNode } from "react";
import ItemFile from "./item-file";
import WKApp from "../../App";
import "./tab-file.css"
import WKSDK, { Channel, ChannelTypePerson } from "wukongimjssdk";

interface TabFileProps {
    keyword?: string;
    files?: any[];
    loadMore?: () => void; // 添加加载更多的回调函数
    onClick?: (item: any) => void;
}

export default class TabFile extends Component<TabFileProps> {

    handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight) {
            if (this.props.loadMore) {
                this.props.loadMore();
            }
        }
    };
    render(): ReactNode {
        return <div className="wk-tab-file" onScroll={this.handleScroll}>
            {
                this.props.files?.map((item: any) => {
                    let sender;
                    const senderChannel = new Channel(item.from_uid, ChannelTypePerson)
                    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(senderChannel)
                    if (channelInfo) {
                        sender = channelInfo.title
                    } else {
                        WKSDK.shared().channelManager.fetchChannelInfo(senderChannel)
                    }

                    return <ItemFile 
                    key={item.message_idstr} 
                    sender={sender} 
                    message={item} 
                    onClick={()=>{
                        if(this.props.onClick) {
                            this.props.onClick(item)
                        }
                    }}
                    />
                })
            }
        </div>
    }
}