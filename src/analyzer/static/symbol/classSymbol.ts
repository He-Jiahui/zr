
import { Symbol} from './symbol';

export class ClassSymbol extends Symbol {
    public readonly type: string = "class";

    public superClass?: ClassSymbol;
}