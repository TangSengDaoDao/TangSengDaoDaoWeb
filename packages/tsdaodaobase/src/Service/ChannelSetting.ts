import { Toast } from "@douyinfe/semi-ui";
import { Channel } from "wukongimjssdk";
import WKApp from "../App";


export class ChannelSettingManager {

    private constructor() {
    }
    public static shared = new ChannelSettingManager()


    mute(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "mute": v ? 1 : 0 }, channel)
    }

    top(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "top": v ? 1 : 0 }, channel)
    }

    save(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "save": v ? 1 : 0 }, channel)
    }

    invite(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "invite": v ? 1 : 0 }, channel)
    }

    remark(remark: string, channel: Channel): Promise<void> {
        return this._onSetting({ "remark": remark }, channel)
    }

    // 消息回执
    receipt(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "receipt": v ? 1 : 0 }, channel)
    }

    // 频道禁言
    forbidden(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "forbidden": v ? 1 : 0 }, channel)
    }
    // 禁止互加好友
    forbiddenAddFriend(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "forbidden_add_friend": v ? 1 : 0 }, channel)
    }

    // 允许新成员查看历史消息
    allowViewHistoryMsg(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "allow_view_history_msg": v ? 1 : 0 }, channel)
    }

    // 允许群成员置顶消息
    allowMemberPinnedMessage(v: boolean, channel: Channel): Promise<void> {
        return this._onSetting({ "allow_member_pinned_message": v ? 1 : 0 }, channel)
    }

    _onSetting(setting: any, channel: Channel): Promise<void> {
        return WKApp.dataSource.channelDataSource.updateSetting(setting, channel).catch((err) => {
            Toast.error(err.msg)
        })
    }
}