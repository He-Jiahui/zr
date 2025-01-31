export class Logger{
    public static date(){
        return new Date().toLocaleString();
    }

    public static error(msg: string){
        console.error(`[Error](${Logger.date()}) ${msg}`);
    }

    public static warn(msg: string){
        console.warn(`[Warn](${Logger.date()}) ${msg}`);
    }

    public static info(msg: string){
        console.info(`[Info](${Logger.date()}) ${msg}`);
    }

    public static verbose(msg: string){
        console.debug(`[Verbose](${Logger.date()}) ${msg}`);
    }
}