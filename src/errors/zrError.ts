import { Location } from "peggy";
import { Logger } from "../utils/logger";

export class ZrError extends Error{
    public errCode: number;
    public location: Location | undefined;
    public fileName: string;
    public get isFault(): boolean{
        return false;
    }
    public constructor(errCode: number, fileName: string, location?: Location){
        super();
        this.errCode = errCode;
        this.location = location;
        this.fileName = fileName;
    }

    public report(){
        if(this.location){
            this.message = i("commonError",{
                errCode: this.errCode.toFixed(),
                message: this.message,
                file: this.fileName,
                line: this.location.line.toFixed(),
                column: this.location.column.toFixed()
            });
        }else{
            this.message = i("commonError2",{
                errCode: this.errCode.toFixed(),
                message: this.message,
                file: this.fileName
            });
        }
        if(this.isFault){
            throw this;
        }
        Logger.error(this.message);
    }
}