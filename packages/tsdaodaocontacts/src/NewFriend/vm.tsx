import { WKSDK, Message, CMDContent } from "wukongimjssdk";
import { FriendApplyState, WKApp, ProviderListener } from "@tsdaodao/base";
import { FriendApply } from "@tsdaodao/base";

export class NewFriendVM extends ProviderListener {
  friendApplys: FriendApply[] = [];
  sureLoading: boolean = false;
  currentFriendApply?: FriendApply;

  async didMount(): Promise<void> {
    WKApp.shared.friendApplyMarkAllReaded();

    this.friendApplys = await this.getFriendApply();
    if (this.friendApplys.length === 0) {
      this.clearFriendApply();
    }
    this.notifyListener();
    // 监听好友申请
    WKSDK.shared().chatManager.addCMDListener(this.friendRequestCMDListener);
  }

  didUnMount(): void {
    // 监听好友申请
    WKSDK.shared().chatManager.removeCMDListener(this.friendRequestCMDListener);
  }

  friendSure(apply: FriendApply) {
    this.sureLoading = true;
    this.currentFriendApply = apply;
    this.notifyListener();

    WKApp.dataSource.commonDataSource
      .friendSure(apply.token || "")
      .then(() => {
        apply.status = FriendApplyState.accepted;
        // WKApp.shared.updateFriendApply(apply);
        this.delFriendApply(apply);
        this.sureLoading = false;
        this.notifyListener();
      })
      .catch(() => {
        this.sureLoading = false;
        this.notifyListener();
      });
  }

  async getFriendApply(): Promise<FriendApply[]> {
    const fromData = {
      page_index: 1,
      page_size: 999,
    };
    const res = await WKApp.apiClient.get("/friend/apply", {
      param: fromData,
    });

    return res;
  }

  async delFriendApply(apply: FriendApply): Promise<void> {
    WKApp.apiClient
      .delete(`/friend/apply/${apply.to_uid}`)
      .then(async () => {
        this.friendApplys = await this.getFriendApply();
        this.sureLoading = false;
        this.notifyListener();
      })
      .catch(() => {
        this.sureLoading = false;
        this.notifyListener();
      });
  }

  async clearFriendApply(): Promise<void> {
    if (WKApp.loginInfo.isLogined()) {
      WKApp.loginInfo.setStorageItem(`${WKApp.loginInfo.uid}-friend-applys-unread-count`, '0')
    }
    await WKApp.apiClient.delete(`/user/reddot/friendApply`);
  }

  public async friendRequestCMDListener(message: Message) {
    console.log("收到CMD->", message);
    const cmdContent = message.content as CMDContent;
    if (cmdContent.cmd === "friendRequest") {
      this.friendApplys = await this.getFriendApply();
    }
  }
}
