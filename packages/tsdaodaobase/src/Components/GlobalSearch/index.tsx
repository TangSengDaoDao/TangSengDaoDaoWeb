import { Component, ReactNode } from "react";
import React from "react";
import { Input } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import { Tabs } from '@douyinfe/semi-ui';
import Provider from "../../Service/Provider";
import GlobalSearchVM from "./vm";
import TabAll from "./tab-all";
import TabContacts from "./tab-contacts";
import TabGroup from "./tab-group";
import TabFile from "./tab-file";
import { Channel } from "wukongimjssdk";

interface GlobalSearchProps {
    channel?: Channel; // 查询指定频道的聊天记录
    // item点击事件，传递item和type，type为contacts、group、message,file
    onClick?: (item: any, type: string) => void;
}

export default class GlobalSearch extends Component<GlobalSearchProps> {
    vm!: GlobalSearchVM


    tabPanel(key: string) {

        // message
        if (key === 'all') {
            return <TabAll
                searchResult={this.vm.searchResult}
                keyword={this.vm.keyword}
                loadMore={() => {
                    this.vm.loadMore()
                }}
                onClick={(item, type) => {
                    if (this.props.onClick) {
                        this.props.onClick(item, type)
                    }
                }}
            />
        }

        // contacts
        if (key === 'contacts') {
            return <TabContacts
                friends={this.vm.searchResult?.friends}
                keyword={this.vm.keyword}
                onClick={(item) => {
                    if (this.props.onClick) {
                        this.props.onClick(item, "contacts")
                    }
                }}
            ></TabContacts>
        }

        // groups
        if (key === 'groups') {
            return <TabGroup
                groups={this.vm.searchResult?.groups}
                keyword={this.vm.keyword}
                onClick={(item) => {
                    if (this.props.onClick) {
                        this.props.onClick(item, "group")
                    }
                }}
            ></TabGroup>
        }

        // files
        if (key === 'files') {
            return <TabFile
                files={this.vm.searchResult?.messages}
                keyword={this.vm.keyword}
                loadMore={() => {
                    this.vm.loadMore()
                }}
                onClick={(item) => {
                    if (this.props.onClick) {
                        this.props.onClick(item, "file")
                    }
                }}
            />
        }
    }

    render(): ReactNode {
        const { channel } = this.props;
        return <Provider
            create={() => {
                this.vm = new GlobalSearchVM()
                this.vm.channel = channel
                return this.vm
            }}
            render={(vm: GlobalSearchVM) => {

                return <div>
                    {
                        vm.searchInChannel ? <div style={{ fontSize: "14px", fontWeight: "500",width:"100%",textAlign:"center",marginBottom: "10px" }}>{vm.searchTitle}</div> : undefined
                    }
                    <Input
                        prefix={<IconSearch />}
                        showClear
                        style={{ height: "40px" }}
                        onCompositionStart={() => { vm.isComposing = true; }}
                        onCompositionEnd={(e: any) => {
                            vm.isComposing = false;
                            vm.handleInputChange(e.target.value);
                        }}
                        onChange={(value) => {
                            vm.handleInputChange(value);
                        }}></Input>
                    <div className="wk-search-tabs">
                        <Tabs
                            tabList={vm.tabList}
                            onChange={key => {
                                vm.onTabClick(key);
                            }}
                        >
                            {this.tabPanel(vm.selectedTabKey)}
                        </Tabs>
                    </div>
                </div>
            }}>

        </Provider>
    }
}