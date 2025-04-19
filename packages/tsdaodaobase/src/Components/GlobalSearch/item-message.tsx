import React from "react";
import { Component, ReactNode } from "react";
import WKAvatar from "../WKAvatar";
import "./item-message.css"
interface ItemMessageProps {
    avatar: string; // 会话头像
    name: string; // 会话名字
    digest: string; // 消息摘要
    sender?: string; // 发送者
    onClick?: () => void;
}

export default class ItemMessage extends Component<ItemMessageProps> {

    render(): ReactNode {

        let digest = this.props?.digest
        if(this.props.sender && this.props.sender !== ""){
            digest = this.props.sender + ": " + digest
        }

        return <div className="wk-item-message" onClick={() => {
            if (this.props.onClick) {
                this.props.onClick()
            }
        } }>
            <WKAvatar src={this.props.avatar} style={{ width: "40px", height: "40px" }}></WKAvatar>
            <div className="wk-item-message-content">
                <div className="wk-item-message-name">{this.props.name}</div>
                {/* <div className="wk-item-message-time">{this.props.time}</div> */}
                <div className="wk-item-message-digest" dangerouslySetInnerHTML={{ __html: digest}}></div>
            </div>
        </div>
    }
}