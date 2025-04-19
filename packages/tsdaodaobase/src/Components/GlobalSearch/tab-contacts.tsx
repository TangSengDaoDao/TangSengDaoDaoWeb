import React, { Component } from "react";
import { ReactNode } from "react";
import ItemContacts from "./item-contacts";
import WKApp from "../../App";
import "./tab-contacts.css"

interface TabContactsProps {
    keyword?: string;
    friends?: any[];
    onClick?: (item: any) => void;
}

export default class TabContacts extends Component<TabContactsProps> {


    render(): ReactNode {
        return <div className="wk-tab-contacts">
            {
                this.props.friends?.map((item: any) => {
                    if (this.props.keyword && item.channel_name.indexOf(this.props.keyword) !== -1) {
                        item.channel_name = item.channel_name.replace(this.props.keyword, `<mark>${this.props.keyword}</mark>`)
                    }
                    return <ItemContacts 
                    key={item.channel_id} 
                    name={item.channel_name} 
                    avatar={WKApp.shared.avatarUser(item.channel_id)} 
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