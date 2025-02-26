import React, { Component } from "react";
import { ReactNode } from "react";
import ItemGroup from "./item-group";
import WKApp from "../../App";
import "./tab-group.css"

interface TabGroupProps {
    keyword?: string;
    groups?: any[];
    onClick?: (item: any) => void;
}

export default class TabGroup extends Component<TabGroupProps> {


    render(): ReactNode {
        return <div className="wk-tab-group">
            {
                this.props.groups?.map((item: any) => {
                    if (this.props.keyword && item.channel_name.indexOf(this.props.keyword) !== -1) {
                        item.channel_name = item.channel_name.replace(this.props.keyword, `<mark>${this.props.keyword}</mark>`)
                    }
                    return <ItemGroup 
                    key={item.channel_id} 
                    name={item.channel_name} 
                    avatar={WKApp.shared.avatarGroup(item.channel_id)}
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