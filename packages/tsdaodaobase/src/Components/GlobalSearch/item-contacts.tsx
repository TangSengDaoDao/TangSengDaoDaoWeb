import React from "react";
import { Component, ReactNode } from "react";
import WKAvatar from "../WKAvatar";
import "./item-contacts.css"
interface ItemContactsProps {
    avatar: string;
    name: string;
    onClick?: () => void;
}

export default class ItemContacts extends Component<ItemContactsProps> {
    
     render(): ReactNode {
            return <div className="wk-item-contacts" onClick={()=>{
                if(this.props.onClick){
                    this.props.onClick()
                }
            }}>
                <WKAvatar src={this.props.avatar} style={{width:"40px",height:"40px"}}></WKAvatar>
                <div className="wk-item-contacts-name" dangerouslySetInnerHTML={{ __html: this.props.name }}></div>
            </div>
        }
}