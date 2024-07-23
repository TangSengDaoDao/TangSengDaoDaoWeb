import React from "react";
import {
  FriendApply,
  FriendApplyState,
  WKApp,
  ContextMenus,
  ContextMenusContext,
  WKViewQueueHeader,
  Provider,
} from "@tsdaodao/base";
import { Component, ReactNode } from "react";
import { Button } from "@douyinfe/semi-ui";
import { NewFriendVM } from "./vm";
import { FriendAdd } from "../FriendAdd";
import "./index.css";

export class NewFriendState {
  selectedItem?: FriendApply; // 被选中的好友
}

export class NewFriend extends Component<any, NewFriendState> {
  contextMenusContext!: ContextMenusContext;

  constructor(props: any) {
    super(props);
  }

  _handleContextMenu(item: FriendApply, event: React.MouseEvent) {
    console.log(item);
    this.contextMenusContext.show(event);
    this.setState({
      selectedItem: item,
    });
  }
  render(): ReactNode {
    return (
      <Provider
        create={() => {
          return new NewFriendVM();
        }}
        render={(vm: NewFriendVM) => {
          return (
            <div className="wk-newfriend">
              <WKViewQueueHeader
                title="新朋友"
                onBack={() => {
                  WKApp.routeLeft.pop();
                }}
                action={
                  <div className="wk-viewqueueheader-content-action">
                    <Button
                      size="small"
                      onClick={() => {
                        WKApp.routeLeft.push(
                          <FriendAdd
                            onBack={() => {
                              WKApp.routeLeft.pop();
                            }}
                          ></FriendAdd>
                        );
                      }}
                    >
                      添加好友
                    </Button>
                  </div>
                }
              ></WKViewQueueHeader>
              <div className="wk-newfriend-content">
                <ul>
                  {vm.friendApplys.map((f) => {
                    return (
                      <li
                        key={f.to_uid}
                        onContextMenu={(e) => {
                          this._handleContextMenu(f, e);
                        }}
                      >
                        <div className="wk-newfriend-content-avatar">
                          <img src={WKApp.shared.avatarUser(f.to_uid)}></img>
                        </div>
                        <div className="wk-newfriend-content-title">
                          <div className="wk-newfriend-content-title-name">
                            {f.to_name}
                          </div>
                          <div className="wk-newfriend-content-title-remark">
                            {f.remark}
                          </div>
                        </div>
                        <div className="wk-newfriend-content-action">
                          <Button
                            loading={
                              vm.currentFriendApply?.to_uid === f.to_uid &&
                              vm.sureLoading
                            }
                            disabled={f.status == FriendApplyState.accepted}
                            onClick={() => {
                              vm.friendSure(f);
                            }}
                          >
                            {f.status == FriendApplyState.accepted
                              ? "已添加"
                              : "确认"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <ContextMenus
                onContext={(context: ContextMenusContext) => {
                  this.contextMenusContext = context;
                }}
                menus={[
                  {
                    title: "删除",
                    onClick: () => {
                      const { selectedItem } = this.state;
                      selectedItem && vm.delFriendApply(selectedItem);
                    },
                  },
                ]}
              />
            </div>
          );
        }}
      ></Provider>
    );
  }
}
