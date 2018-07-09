
import { SPHttpClient } from '@microsoft/sp-http';
export interface IWpatcdcenterProps {
  spHttpClient: SPHttpClient;
  description: string;
  siteurl: string;
  Title:string;
  Type:string;
  Department:string;
  ToUser:string;
  FromUser:string;
  Note:string;
  DepartmentArray:Array<String>;
  TypeArray:Array<String>;
  FromArray:Array<String>;
  ToArray:Array<String>;
  ReferenceNumber:string;
  ItemGuid:string;
  Loading: number;
  ItemId:number;
  FileUploaded:string;
  ResultArray:Array<String>;
  ItemCountExisting:number;
  IsNewItem:number;
  IsFileUploaded:number;
  checked: boolean;
  IsItemSearch:boolean;
  FromDate:string;
  ToDate:string;
  CachedData:Array<object>;
}
