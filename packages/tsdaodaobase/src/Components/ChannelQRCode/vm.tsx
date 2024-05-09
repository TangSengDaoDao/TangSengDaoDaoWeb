import { Channel } from "wukongimjssdk";
import WKApp from "../../App";
import { ChannelQrcodeResp } from "../../Service/DataSource/DataSource";
import { ProviderListener } from "../../Service/Provider";
import { Toast } from "@douyinfe/semi-ui";


export class ChannelQRCodeVM extends ProviderListener {
    channel!:Channel
    qrcodeResp?: ChannelQrcodeResp

    constructor(channel:Channel) {
        super()
        this.channel = channel
    }   

    didMount(): void {
       this.requestQRCode()
    }

    requestQRCode() {
        WKApp.dataSource.channelDataSource.qrcode(this.channel).then((resp)=>{
            this.qrcodeResp = resp
            this.notifyListener()
        }).catch((err) => {
            Toast.error(err.msg)
        })
        
    }
}