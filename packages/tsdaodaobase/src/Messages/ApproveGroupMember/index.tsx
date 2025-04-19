import { SystemContent } from "wukongimjssdk"
import React from "react"
import { MessageCell } from "../MessageCell"
import './index.css'
import { MessageWrap } from "../../Service/Model"
import WKApp from "../../App"

export class ApproveGroupMemberCell extends MessageCell {

    render() {
        const { message } = this.props
        const content = message.content as SystemContent
        return <div className="wk-message-system">{content.displayText}<a href="#" onClick={() => this.goApproval(message)} className="wk-message-approve">去审核</a></div>
    }

    async goApproval(message: MessageWrap) {
        let inviteNo = message.content["content"]["invite_no"]
        const resp = await WKApp.apiClient.get(`groups/${message.channel.channelID}/member/h5confirm`, {
            param: { invite_no: inviteNo || '' },
        });
        if (resp) {
            let url = resp["url"]
            if (url) {
                window.open(url, '_blank');
            }
        }
    }

}