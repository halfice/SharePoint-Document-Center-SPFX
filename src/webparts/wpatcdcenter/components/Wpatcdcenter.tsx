import * as React from 'react';
import styles from './Wpatcdcenter.module.scss';
import { IWpatcdcenterProps } from './IWpatcdcenterProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { GridForm, Fieldset, Row, Field } from 'react-gridforms'
import { SPComponentLoader } from '@microsoft/sp-loader';
import { default as pnp, ItemAddResult, Web } from "sp-pnp-js";
import * as jquery from 'jquery';
import ReactFileReader from 'react-file-reader';
import Toggle from 'react-toggle';
import * as Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import Moment from 'react-moment';
var moment = require('moment');

export default class Wpatcdcenter extends React.Component<IWpatcdcenterProps, {}> {

  protected onInit(): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (error?: any) => void): void => {
      pnp.setup({
        sp: {
          headers: {
            "Accept": "application/json; odata=nometadata"
          }
        }
      });
      resolve();
    });
  }

  public state: IWpatcdcenterProps;
  constructor(props, context) {
    super(props);
    this.state = {
      spHttpClient: this.props.spHttpClient,
      description: "",
      siteurl: "",
      Title: "",
      Type: "",
      Department: "Select Department",
      ToUser: "",
      FromUser: "",
      Note: "",
      DepartmentArray: [],
      TypeArray: [],
      FromArray: [],
      ToArray: [],
      ReferenceNumber: "",
      ItemGuid: this.GenerateGuid().toString(),
      Loading: 0,
      ItemId: 0,
      FileUploaded: "",
      ResultArray: [],
      ItemCountExisting: 0,
      IsNewItem: 0,
      IsFileUploaded: 0,
      checked: false,
      IsItemSearch: false,
      FromDate: "",
      ToDate: "",
      CachedData: [],

    };

    this.handleChange = this.handleChange.bind(this);
    this.onToggle = this.onToggle.bind(this);

    SPComponentLoader.loadCss(' https://cdnjs.cloudflare.com/ajax/libs/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js');
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css');
    SPComponentLoader.loadScript('https://npmcdn.com/react-bootstrap-table/dist/react-bootstrap-table.min.js');
    SPComponentLoader.loadCss('https://npmcdn.com/react-bootstrap-table/dist/react-bootstrap-table-all.min.css');
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css');
    SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/react-toggle@4.0.2/style.css');


  }

  onToggle() {

    if (this.state.IsItemSearch == false) {
      this.setState({ IsItemSearch: true });
    } else {
      this.setState({ IsItemSearch: false });
    }
  }

  public onSelectDateFrom(event: any): void {
    this.setState({ FromDate: event._d });
  }

  public onSelectDateTo(event: any): void {
    this.setState({ ToDate: event._d });
  }


  handleChange(checked) {
    this.setState({ checked });
  }

  public GoSliderBack() {
    event.preventDefault();
  }

  GenerateGuid() {
    var date = new Date();
    var guid = date.valueOf();
    return guid;
  }

  getYear() {
    return new Date().getFullYear();
  }


  onChangeFrom(event: any): void {
    this.setState({
      FromUser: event.target.value,
    });
  }

  onChangeTo(event: any): void {
    this.setState({
      ToUser: event.target.value,
    });
  }

  OnChangeDepartment(event: any): void {
    var temp = event.target.value;
    if (temp == "Select Department") return;
    var NewPaddingNumner = this.zeroPad(this.state.ItemCountExisting, 4);
    var FinalREf = temp + "-" + this.getYear() + "-" + NewPaddingNumner;
    this.setState({
      Department: event.target.value,
      ReferenceNumber: FinalREf,
    });
  }

  OnChangeType(event: any): void {
    this.setState({
      Type: event.target.value,
    });
  }

  componentDidMount() {
    this.SearchItem();
  }

  private SearchItem(): void {
    var reactHandler = this;
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("SitePages", "");
    jquery.ajax({
      url: `https://mysite.sharepoint.com/ceooffice/_api/web/lists/getbytitle('CeoDocuments')/items?&$select=Title,ID,ReferenceNumber,CeoDepartment,DocumentType,CompanyFrom,CompanyTo,Note,Created,FileRef`,
      type: "GET",
      headers: { 'Accept': 'application/json; odata=verbose;' },
      success: function (resultData) {
        var myObject = resultData.d.results.length;
        var AnotherCounter = 0;
        myObject++;
        AnotherCounter = myObject;
        this.setState({
          ResultArray: resultData.d.results,
          ItemCountExisting: AnotherCounter,
        });
        if (this.state.IsNewItem == 1) {
          this.CreateItemFinal();
        } else {
          this._renderListAsync();
          this.GenerateReferenceAfterInsert();
        }
      }.bind(this),
      error: function (jqXHR, textStatus, errorThrown) {
      }
    });
  }

  private _renderListAsync(): void {
    var reactHandler = this;
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("SitePages", "");
    console.log(NewSiteUrl);
    jquery.ajax({
      url: `${NewSiteUrl}/_api/web/lists/getbytitle('Department')/items?&$select=Title,ID`,
      type: "GET",
      headers: { 'Accept': 'application/json; odata=verbose;' },
      success: function (resultData) {
        var TempArray = this.state.DepartmentArray;
        TempArray.push("90001|Select Department")
        for (var x = 0; x < resultData.d.results.length; x++) {
          TempArray.push(resultData.d.results[x]["ID"].toString() + "|" + resultData.d.results[x]["Title"].toString());
        }
        this._renderListAsync2();
        this.setState({ DepartmentArray: TempArray })
      }.bind(this),
      error: function (jqXHR, textStatus, errorThrown) {
      }
    });
  }

  public GenerateReferenceAfterInsert() {
    var myObject = this.state.ItemCountExisting;
    var AnotherCounter = 0;
    myObject++;
    AnotherCounter = myObject;
    var NewPaddingNumner = this.zeroPad(AnotherCounter, 4);
    var FinalREf = this.state.Department + "-" + this.getYear() + "-" + NewPaddingNumner;
    this.setState({
      ReferenceNumber: FinalREf,
    });
  }

  private _renderListAsync2(): void {
    var reactHandler = this;
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("SitePages", "");
    console.log(NewSiteUrl);
    jquery.ajax({
      url: `${NewSiteUrl}/_api/web/lists/getbytitle('Letter Types')/items?&$select=Title,ID`,
      type: "GET",
      headers: { 'Accept': 'application/json; odata=verbose;' },
      success: function (resultData) {
        var TempArray = this.state.TypeArray;
        TempArray.push("90001|Select Type")
        for (var x = 0; x < resultData.d.results.length; x++) {
          TempArray.push(resultData.d.results[x]["ID"].toString() + "|" + resultData.d.results[x]["Title"].toString());
        }
        this.FromBinding();
        this.setState({ TypeArray: TempArray })
      }.bind(this),
      error: function (jqXHR, textStatus, errorThrown) {
      }

    });
  }

  private FromBinding(): void {
    var reactHandler = this;
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("SitePages", "");
    console.log(NewSiteUrl);
    jquery.ajax({
      url: `${NewSiteUrl}/_api/web/lists/getbytitle('Department')/items?&$select=Title,ID`,
      type: "GET",
      headers: { 'Accept': 'application/json; odata=verbose;' },
      success: function (resultData) {
        var TempArray = this.state.FromArray;
        TempArray.push("90001|Select From Dept")
        for (var x = 0; x < resultData.d.results.length; x++) {
          TempArray.push(resultData.d.results[x]["ID"].toString() + "|" + resultData.d.results[x]["Title"].toString());
        }
        this.ToBinding();
        this.setState({ FromArray: TempArray })
      }.bind(this),
      error: function (jqXHR, textStatus, errorThrown) {
      }
    });
  }

  private ToBinding(): void {
    var reactHandler = this;
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("SitePages", "");
    console.log(NewSiteUrl);
    jquery.ajax({
      url: `${NewSiteUrl}/_api/web/lists/getbytitle('Department')/items?&$select=Title,ID`,
      type: "GET",
      headers: { 'Accept': 'application/json; odata=verbose;' },
      success: function (resultData) {
        var TempArray = this.state.ToArray;
        TempArray.push("90001|Select To Dep")
        for (var x = 0; x < resultData.d.results.length; x++) {
          TempArray.push(resultData.d.results[x]["ID"].toString() + "|" + resultData.d.results[x]["Title"].toString());
        }
        this.setState({ FromArray: TempArray });
      }.bind(this),
      error: function (jqXHR, textStatus, errorThrown) {
      }
    });
  }


  public CreateNewItem(event: any): void {
    if (this.state.Type != "" && this.state.Department != "" && this.state.FromUser != "" && this.state.ToUser != "" && this.state.Title != "") {

      if (this.state.IsFileUploaded == 1) {
        this.setState({
          IsNewItem: 1,
          Loading: 1
        });
        this.SearchItem();
      } else {
        alert("Choose Document to Upload!!!!!");
      }
    }
    else {
      alert("Choose all options!!!!!!")
    }

  }

  public CreateItemFinal() {
    var NewPaddingNumner = this.zeroPad(this.state.ItemCountExisting, 4);
    var Temp = this.state.ReferenceNumber.split('-');
    var NewFinalRef = Temp[0] + "-" + Temp[1] + "-" + NewPaddingNumner;
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("/SitePages", "");
    let webx = new Web(NewSiteUrl);
    webx.getFolderByServerRelativeUrl(this.state.FileUploaded).getItem().then(item => {
      webx.lists.getByTitle("CeoDocuments").items.getById(item["ID"]).update({
        Title: this.state.Title,
        CompanyFrom: this.state.FromUser == 'NA' ? null : this.state.FromUser,
        CompanyTo: this.state.ToUser == 'NA' ? null : this.state.ToUser,
        DocumentType: this.state.Type == 'NA' ? null : this.state.Type,
        CeoDepartment: this.state.Department,
        Note: this.state.Note,
        ReferenceNumber: NewFinalRef,
      }).then(r => {
        this.setState({
          Loading: 0, IsNewItem: 0,
          ItemId: 0,
          IsFileUploaded: 0,
        });
        this.SearchItem();
      });
    }); //Retrive Doc Info End
  }

  public zeroPad(num, places) {
    //////zeroPad(5, 2); // "05"
    //zeroPad(5, 4); // "0005"
    //zeroPad(5, 6); // "000005"
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  public OnchangeTitle(event: any): void {
    this.setState({ Title: event.target.value });
  }

  public OnChangeNotes(event: any): void {
    this.setState({ Note: event.target.value });
  }

  handleFiles = files => {
    var TemFileGuidName = [];
    var component = this;
    component.setState({ Loading: 1, IsFileUploaded: 1 });
    var FileExtension = this.getFileExtension1(files.fileList[0].name);
    var date = new Date();
    var guid = date.valueOf();
    if (this.state.ItemGuid == "-1") {
      this.setState({ ItemGuid: guid });
    }
    var NewISiteUrl = this.props.siteurl;
    var NewSiteUrl = NewISiteUrl.replace("/SitePages", "");
    console.log(NewSiteUrl);
    var FinalName = guid + "." + FileExtension;
    let webx = new Web(NewSiteUrl);
    //webx.lists.getByTitle("RFI").items.add({
    webx.get().then(r => {
      var myBlob = this._base64ToArrayBuffer(files.base64);
      webx.getFolderByServerRelativeUrl("CeoDocuments")
        .files.add(FinalName.toString(), myBlob, true)
        .then(function (data) {
          var RelativeUrls = "CeoDocuments/" + FinalName;//files.fileList[0].name;
          webx.getFolderByServerRelativeUrl(RelativeUrls).getItem().then(item => {
            var ItemIdInserted = item["ID"];
            TemFileGuidName[0] = files.fileList[0].name + "|" + item["ID"];
            webx.lists.getByTitle("CeoDocuments").items.getById(item["ID"]).update({
              Guid0: guid.toString(),
              Actual: files.fileList[0].name
            }).then(r => {
              component.setState({ Loading: 0, ItemId: ItemIdInserted, FileUploaded: RelativeUrls });
            });
          }); //Retrive Doc Info End
        });
    });
  }




  handleChangeSearch(ItemResult) {
    this.setState({ IsItemSearch: ItemResult });

  }

  private getFileExtension1(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
  }
  private _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64.split(',')[1]);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);//
      //atcae
    }
    return bytes.buffer;
  }

  /*
Documents	e7ec8cee-ded8-43c9-beb5-436b54b31e84
Items matching a content type	5dc9f503-801e-4ced-8a2c-5d1237132419
Items matching a tag	e1327b9c-2b8c-4b23-99c9-3730cb29c3f7
Items related to current user	48fec42e-4a92-48ce-8363-c2703a40e67d
Items with same keyword as this item	5c069288-1d17-454a-8ac6-9c642a065f48
Local People Results	b09a7990-05ea-4af9-81ef-edfab16c4e31
Local Reports And Data Results	203fba36-2763-4060-9931-911ac8c0583b
Local SharePoint Results	8413cd39-2156-4e00-b54d-11efd9abdb89
Local Video Results	78b793ce-7956-4669-aa3b-451fc5defebf
Pages	5e34578e-4d08-4edc-8bf3-002acf3cdbcc
Pictures	38403c8c-3975-41a8-826e-717f2d41568a
Popular	97c71db1-58ce-4891-8b64-585bc2326c12
Recently changed items	ba63bbae-fa9c-42c0-b027-9a878f16557c
Recommended Items	ec675252-14fa-4fbe-84dd-8d098ed74181
Wiki	9479bf85-e257-4318-b5a8-81a180f5faa1



  */

  SearchList() {
    event.preventDefault();
    this.setState({
      Loading: 1
    });

    var Dept = this.state.Department;
    var RefNumber = this.state.ReferenceNumber;
    var Title = this.state.Title;
    var Typex = this.state.Type;
    var From = this.state.FromUser;
    var Tos = this.state.ToUser;
    var Notx = this.state.Note;
    var Fromdt = this.state.FromDate;
    var todt = this.state.ToDate;

    

    jquery.ajax({
      url: `https://mysite.sharepoint.com/ceooffice/_api/search/query?querytext=%27contenttype:CeoOfficeContentType%27&sourceid=%278413cd39-2156-4e00-b54d-11efd9abdb89%27&selectproperties=%27CompanyToOWSTEXT,Guid0OWSTEXT,Title,CompanyFromOWSTEXT,DocumentTypeOWSTEXT,CeoDepartmentOWSTEXT,ReferenceNumberOWSTEXT,CreatedOWSDATE,FileName%27`,
      type: "GET",
      headers: { 'Accept': 'application/json; odata=verbose;' },
      success: function (resultData) {
        var len = resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length;
        var TempComplete = [];
        for (var i = 0; i < len; i++) {
          var newdtd = moment.utc(resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[6].Value);
          var NewData = {
            
            DocId: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[1].Value,
            Title: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[3].Value,
            DocumentType: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[4].Value,
            ReferenceNumber: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[5].Value,
            Created:newdtd ,
            CompanyTo: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[8].Value,
            CompanyFrom: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[9].Value,
            CeoDepartment: resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[10].Value,
            Fileurl: "http://mysite.sharepoint.com/ceooffice/ceoDocuments/" + resultData.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results[7].Value
          }
          TempComplete.push(NewData);
        }
        if (Dept != "Select Department") {
          TempComplete = TempComplete.filter(function (TempComplete) {
            return TempComplete.CeoDepartment == Dept;
          });
        }

        if (Title != "") {
          TempComplete = TempComplete.filter(function (TempComplete) {
            return TempComplete.Title == Title;
          });
        }

        if (Typex != "") {
          TempComplete= TempComplete.filter(function (TempComplete) {
            return TempComplete.DocumentType == Typex;
          });
        }

        if (Fromdt != "") {
          var NewFromDt=moment.utc(Fromdt);
          TempComplete= TempComplete.filter(function (TempComplete) {
            return TempComplete.Created > NewFromDt;
          });
        }

        if (todt != "") {
          var NewToDt=moment.utc(todt);
          TempComplete= TempComplete.filter(function (TempComplete) {
            return TempComplete.Created < NewToDt;
          });
        }


          this.setState({
            CachedData: TempComplete,
            Loading: 0
          });
        
        

      }.bind(this),
      error: function (jqXHR, textStatus, errorThrown) {
      }
    });



  }






  public render(): React.ReactElement<IWpatcdcenterProps> {

    var options = this.state.DepartmentArray.map(function (item, i) {
      var Trmp = item.split('|');
      return <option value={Trmp[1]} key={Trmp[0]}>{Trmp[1]}</option>
    });

    var optionsType = this.state.TypeArray.map(function (item, i) {
      var Trmp = item.split('|');
      return <option value={Trmp[1]} key={Trmp[0]}>{Trmp[1]}</option>
    });

    var FromOptions = this.state.FromArray.map(function (item, i) {
      var Trmp = item.split('|');
      return <option value={Trmp[1]} key={Trmp[0]}>{Trmp[1]}</option>
    });

    var ToOptions = this.state.ToArray.map(function (item, i) {
      var Trmp = item.split('|');
      return <option value={Trmp[1]} key={Trmp[0]}>{Trmp[1]}</option>
    });

    if (this.state.CachedData.length > 0) {
      var SearchItem3 = this.state.CachedData.map(function (item, i) {
        var TempFromDate = item["Created"];
        var dateFormat = require('dateformat');
        var FinalDate = dateFormat(TempFromDate, "dd-mm-yyyy");
        return (<Row>
          <Field span={1}>{item["ReferenceNumber"]}
          </Field>
          <Field span={1}>{item["Title"]}
          </Field>
          <Field span={1}>{item["DocumentType"]}
          </Field>
          <Field span={1}>{item["CompanyFrom"]}
          </Field>
          <Field span={1}>{item["CompanyTo"]}
          </Field>
          <Field span={1}>{FinalDate}
          </Field>
          <Field span={1}> <a href={item["Fileurl"]} target="_blank">
            <img src="https://mysite.sharepoint.com/PublishingImages/viewdoc.png" />
          </a>
          </Field>

        </Row>)
      });
    }

    if (this.state.ResultArray.length > 0) {
      var SearchItems = this.state.ResultArray.map(function (item, i) {
        var TempFromDate = item["Created"];
        var dateFormat = require('dateformat');
        var FinalDate = dateFormat(TempFromDate, "dd-mm-yyyy");
        return (<Row>
          <Field span={1}>{item["ReferenceNumber"]}
          </Field>
          <Field span={1}>{item["Title"]}
          </Field>
          <Field span={1}>{item["DocumentType"]}
          </Field>
          <Field span={1}>{item["CompanyFrom"]}
          </Field>
          <Field span={1}>{item["CompanyTo"]}
          </Field>
          <Field span={1}>{FinalDate}
          </Field>
          <Field span={1}> <a href={item["FileRef"]} target="_blank">
            <img src="https://mysite.sharepoint.com/PublishingImages/viewdoc.png" />
          </a>
          </Field>

        </Row>)
        //      console.log(item["Title"]);
      });
    }


    return (
      <div className={styles.wpatcdcenter}>
        <div className={styles.container}>
          <div className={styles.row}>
            <GridForm>
              <Fieldset legend="Document Master">
                <Row>
                  <Field span={2}>
                    <label>Departments*</label>
                    <select value={this.state.Department} className={styles.myinput} onChange={this.OnChangeDepartment.bind(this)}>{options}
                    </select>
                  </Field>
                  <Field span={2}>
                    <label>Reference #</label>
                    {this.state.ReferenceNumber}
                  </Field>

                </Row>

                <Row>
                  <Field span={3}>
                    <div>
                      <ReactFileReader fileTypes={[".csv", ".xlsx", ".Docx", ".pdf", ".doc", ".xls"]} handleFiles={this.handleFiles.bind(this)} base64={true} >
                        <button onClick={this.GoSliderBack.bind(this)} className={styles.uploadbutton}>Upload</button>
                      </ReactFileReader>
                    </div>
                  </Field>
                </Row>


                <Row >
                  <Field span={2} >
                    <label>Title*</label>
                    <input type="text" value={this.state.Title} onChange={this.OnchangeTitle.bind(this)} />
                  </Field>
                  <Field span={2} >
                    <label>Type*</label>
                    <select value={this.state.Type} className={styles.myinput} onChange={this.OnChangeType.bind(this)}>{optionsType}
                    </select>

                  </Field>
                </Row>


                <Row >
                  <Field span={2} >
                    <label>From*</label>
                    <select value={this.state.FromUser} className={styles.myinput} onChange={this.onChangeFrom.bind(this)}>{FromOptions}
                    </select>
                  </Field>
                  <Field span={2} >
                    <label>To*</label>
                    <select value={this.state.ToUser} className={styles.myinput} onChange={this.onChangeTo.bind(this)}>{ToOptions}
                    </select>
                  </Field>
                </Row>
                <Row>
                  <Field span={4}>
                    <label>Note*</label>
                    <input type="text" className={styles.myinput} value={this.state.Note} onChange={this.OnChangeNotes.bind(this)} />
                  </Field>
                </Row>
              </Fieldset>


              <Row>
                <Field span={2}>
                  <label>
                    <Toggle
                      defaultChecked={this.state.IsItemSearch}
                      onChange={this.onToggle} />
                    <span>Search</span>
                  </label>
                </Field>


              </Row>
            </GridForm>

            <Row>
              <Field span={2}>
                {this.state.IsItemSearch == false &&
                  <div className={styles.FooterButtonDiv}>
                    <input type="button" className={styles.submitButton} onClick={this.CreateNewItem.bind(this)} value="Submit / Save " />
                  </div>
                }

                {this.state.IsItemSearch == true &&
                  <GridForm>
                    <Row>
                      <Field span={1} >
                        <label>From Date</label>
                        <Datetime dateFormat="DD-MM-YYYY" timeFormat={false} value={this.state.FromDate} onChange={this.onSelectDateFrom.bind(this)} />
                      </Field>
                      <Field span={1} >
                        <label>To Date</label>
                        <Datetime dateFormat="DD-MM-YYYY" timeFormat={false} value={this.state.ToDate} onChange={this.onSelectDateTo.bind(this)} />
                      </Field>
                      <Field span={2} >
                        <input type="button" className={styles.submitSEarchButton} onClick={this.SearchList.bind(this)} value="Searh Document" />
                      </Field>
                    </Row>
                  </GridForm>

                }


              </Field>
            </Row>
          </div>
          {
            this.state.Loading > 0 &&
            <div>
              <div className={styles.LoaderDivOnPage}>
                <img src="https://www.pdfen.com/images/stories/plaatjes/pdfen/gears_360.gif" className={styles.ImagesClassLoader} />
              </div>

            </div>
          }
          {this.state.IsItemSearch == false &&
            <div className={styles.SearchResultGrid}>
              <GridForm>
                <Fieldset legend="Document Center">
                  <Row className={styles.headerrow}>
                    <Field span={1} >Reference</Field>
                    <Field span={1}>Title</Field>
                    <Field span={1}>Type</Field>
                    <Field span={1}>From</Field>
                    <Field span={1}>To</Field>
                    <Field span={1}>Date</Field>
                    <Field span={1}>Action</Field>
                  </Row>
                  <Row>
                    {SearchItems}
                  </Row>
                </Fieldset>
              </GridForm>
            </div>
          }
          {this.state.IsItemSearch == true && this.state.CachedData.length > 0 &&
            < div className={styles.SearchResultGrid}>
              <GridForm>
                <Fieldset legend="Document Center- Search Result">
                  <Row className={styles.headerrow}>
                    <Field span={1} >Reference</Field>
                    <Field span={1}>Title</Field>
                    <Field span={1}>Type</Field>
                    <Field span={1}>From</Field>
                    <Field span={1}>To</Field>
                    <Field span={1}>Date</Field>
                    <Field span={1}>Action</Field>
                  </Row>
                  <Row>
                    {SearchItem3}
                  </Row>
                </Fieldset>
              </GridForm>
            </div>
          }

        </div>

      </div >

    );
  }
}
