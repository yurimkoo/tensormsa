import React from 'react';
import Api from './../utils/Api'
import Modal from 'react-modal';
import ReportRepository from './../repositories/ReportRepository'
import FileUploadComponent from './../NNLayout/common/FileUploadComponent'
import JsonConfComponent from './../NNLayout/common/JsonConfComponent'
import NN_InfoNewCompDetail1 from './../NNConfiguration/NN_InfoNewCompDetail1'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';

export default class NN_InfoNewComponent extends React.Component {
    constructor(props, context) {
        super(props);
        this.state = {
            tableData: null,
            NN_TableMaster: null,
            NN_TableMasterAuto: null,
            NN_TableData: null,
            NN_TableDataDetail : null,
            nn_id : null,
            wf_ver_id : null,
            color : "red",
            train_node_name:null,
            eval_node_name:null,
            tmp_train_node_name:"tmpTrainNodeName",
            tmp_eval_node_name:"tmpEvalNodeName",
            NN_TableColArr1:[    {index:0,      id:"title",                 name:"Title"}
                                ,{index:1,      id:"input_data",            name:"Input Data"}
                                ,{index:2,      id:"example",               name:"Example"}
                            ],
            NN_TableRowArr1:["", "biz_cate","biz_sub_cate","nn_title","nn_desc"],
            NN_TableColArr2:[    {index:0,      id:"title",            name:"Auto ML"}
                                ,{index:1,      id:"input_data",            name:"Input Data"}
                                ,{index:2,      id:"example",               name:"Example"}
                            ],
            NN_TableRowArr2:["generation","population","survive"],
            tabIndex:1,
            tabIndexAS:1,
            autoMasterView:true,
            g_limit:100,
            p_limit:100,
            tVerCnt:0,
            tVerDesc:"",
            g_cnt:3,
            p_cnt:3,
            s_cnt:2
        };
    }

    // 최초 1회 실행하여 Network Config List를 가져온다.
    componentDidMount(){
        this.props.setActiveItem("init",null,null,null,null,null,null,null);

        if(this.state.train_node_name == null){
            this.props.reportRepository.getFileUpload(this.state.tmp_train_node_name, "1", "1", "tmp").then((tableData) => {
                // this.state.train_node_name = tableData["path"]
                this.setState({ train_node_name: tableData["path"] })
            });
        }
        
        if(this.state.eval_node_name == null){
            this.props.reportRepository.getFileUpload(this.state.tmp_eval_node_name, "1", "1", "tmp").then((tableData) => {
                // this.state.eval_node_name = tableData["path"]
                this.setState({ eval_node_name: tableData["path"] })
            });
        }

        this.handleChange()
    }

    findColInfo(col, idxType, idxName){
        let fItem = ""
        if(idxType == "index"){
            fItem = col.find(data => { return data.index == idxName})
        }else if(idxType == "id"){
            fItem = col.find(data => { return data.id == idxName})
        }else if(idxType == "name"){
            fItem = col.find(data => { return data.name == idxName})
        }

        return fItem
    }

    // Network Create
    saveData() {
        let flag = "T"
        let title = ""
        let input_data = ""
        let refsTab = ""

        //Validation Check Select Network
        if(this.state.tabIndex == 1){
            refsTab = this.refs.netDetail1
        }else if(this.state.tabIndex == 2){
            refsTab = this.refs.netDetail2
        }else if(this.state.tabIndex == 3){
            refsTab = this.refs.netDetail3
        }

        let netType = refsTab.state.netType
        if(flag == "T" && (netType == null || netType == "")){ 
            alert( "Select a Network Type") 
            return
        }

        let table = this.refs.master1
        let col = this.state.NN_TableColArr1

        // Make NN Info
        let dparam = {}
        dparam["use_flag"] = "Y"
        dparam["config"] = "N"
        dparam["dir"] = netType

        for (let i=1 ; i < table.rows.length ; i++) {
            title = table.rows[i].cells[this.findColInfo(col, "id", "title").index].innerText
            input_data = table.rows[i].cells[this.findColInfo(col, "id", "input_data").index].children[0].value
            dparam[this.state.NN_TableRowArr1[i]] = input_data
            // Validation Check Master1
            if(input_data == null || input_data == ""){ alert( title + " is not exist." );return; flag = "F"; break;}
        }

        let params = refsTab.refs.netconfig.getConfigData()
        let nodekeys = Object.keys(params)

        // Make NNAuto Info
        let aparam = {}
        dparam["automl_parms"] = params
        
        if(this.state.tabIndexAS == 1){
            let tableAuto = this.refs.master2
            let colAuto = this.state.NN_TableColArr2

            // Validation Check MasterAuto
            for (let i=0 ; i < tableAuto.rows.length ; i++) {
                title = tableAuto.rows[i].cells[this.findColInfo(col, "id", "title").index].innerText
                input_data = tableAuto.rows[i].cells[this.findColInfo(col, "id", "input_data").index].children[0].value*1
                aparam[this.state.NN_TableRowArr2[i]] = input_data
                // Validation Check Master2
                if(input_data == null || input_data == ""){ alert( title + " is not exist." );return; flag = "F"; break;}
            }   

            if(aparam['population'] <= aparam['survive']){
                alert( 'Survive('+ aparam['survive'] +') can not be greater than Population('+aparam['population']+')' );
                return; 
            }

            if(aparam['population'] > this.state.p_limit){
                alert( 'Population('+ aparam['population'] +') can not be greater than Population('+this.state.p_limit+')' );
                return; 
            }

            if(aparam['generation'] > this.state.g_limit){
                alert( 'Generation('+ aparam['generation'] +') can not be greater than Generation('+this.state.g_limit+')' );
                return; 
            }
        }
        
        // Make NN WF Info
        let wfparam = {}
        wfparam["nn_def_list_info_nn_id"] = ""
        wfparam["nn_wf_ver_info"] = "init"
        wfparam["condition"] = "1"
        wfparam["active_flag"] = "Y"

        // Make NN WF Node Info
        let nodeparam = {}
        nodeparam["type"] = netType
        let desc = ""

        let tfparam = {}
        tfparam["first_tmp_folder"] = this.state.tmp_train_node_name
        tfparam["last_tmp_folder"] = this.state.train_node_name

        let efparam = {}
        efparam["first_tmp_folder"] = this.state.tmp_eval_node_name
        efparam["last_tmp_folder"] = this.state.eval_node_name

        //  "nn00000030"
        // let wf_ver_id = "1"

        let re = confirm( "Do you create?" )
        let nn_id = ""
        let nn_node = ""
        let netconf_data_name = ""
        let eval_data_name = ""
        if(re == true){
            // Make NN Info
            this.props.reportRepository.postCommonNNInfo("new", dparam).then((tableData) => {
                nn_id = tableData['nn_id']
                this.setState({ nn_id : nn_id })
                for(let i in tableData['graph']){
                    nn_node = tableData['graph'][i]['fields']['graph_node']
                    if(nn_node == 'netconf_data'){
                        netconf_data_name = tableData['graph'][i]['fields']['graph_node_name']
                    }
                    if(nn_node == 'eval_data'){
                        eval_data_name = tableData['graph'][i]['fields']['graph_node_name']
                    }
                }

                if(netconf_data_name != "" && eval_data_name != ""){
                    this.props.reportRepository.putFileUpload(nn_id, 'common', netconf_data_name, tfparam).then((tableData) => {
                        this.props.reportRepository.putFileUpload(nn_id, 'common', eval_data_name, efparam).then((tableData) => {
                            if(this.state.tabIndexAS == 1){
                                //Set AutoML Parameter
                                this.props.reportRepository.postCommonNNInfoAutoSetup(nn_id, aparam).then((tableData) => {
                                    // //Run AutoML
                                    // this.props.reportRepository.postCommonNNInfoAuto(nn_id).then((tableData) => {
                                    
                                    // });
                                });
                            }else{
                                // //version create
                                // this.props.reportRepository.postCommonNNInfoWF(nn_id, wfparam).then((ver) => {
                                //     //node create
                                //     this.props.reportRepository.postCommonNNInfoWFNode(nn_id, ver, nodeparam).then((tableData) => {
                                //         //node config update
                                //         for(let i in nodekeys){
                                //             this.props.reportRepository.putCommonNNInfoWFNode(nn_id, ver, nodekeys[i], params[nodekeys[i]]).then((tableData) => {

                                //             });
                                //         }
                                //     });
                                // });
                            }
                        });
                    });
                }
                this.props.setActiveItem(nn_id, "C", null, null, null, null, null, null)
                return this.props.getHeaderEvent(6);
            });

        }
    }

    networkSelectTabAS(value){
        // let tab = value.target.innerText
        value = value.tabIndexAS + 1
        this.setState({ tabIndexAS: value })

        if(value == 2){
            this.state.autoMasterView = false
        }else{
            this.state.autoMasterView = true
        }

        let refsTab = this.refs.netDetail1
            
        if(refsTab == undefined){
            refsTab = this.refs.netDetail2
            if(refsTab == undefined){
                refsTab = this.refs.netDetail3
            }
        }

        refsTab.setConfigData()
    }

    networkSelectTab(value){
        // let tab = value.target.innerText
        value = value.tabIndex + 1
        this.setState({ tabIndex: value })
    }

    handleChange(selectedValue){
         
        let table = this.refs.master2
        let g_cnt = this.state.g_cnt
        let p_cnt = this.state.p_cnt
        let s_cnt = this.state.s_cnt

        if(selectedValue != undefined){// key, desc cell
            let value = selectedValue.target.value
            g_cnt = table.rows[0].cells[1].children[0].value*1
            p_cnt = table.rows[1].cells[1].children[0].value*1
            s_cnt = table.rows[2].cells[1].children[0].value*1
        }

        let t_cnt = 0
        let t_desc = ""
        for(let i=0;i < g_cnt ; i++){
            if(i == 0){
                t_cnt += p_cnt
                
            }else{
                t_cnt += p_cnt-s_cnt
            }
        }

        t_desc += "최초 "+p_cnt+"Ver를 생성하며 나머지 세대별 "+(p_cnt-s_cnt)+"Ver 생성." 
        this.setState({ tVerCnt: t_cnt })
        this.setState({ tVerDesc: t_desc })
    }

    render() {
        let k = 1
        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        function makeHeader(data){// Make header
            let headerData = []
            for(let i in data){
                headerData.push(<th key={k++} style={{"textAlign":"center"}} >{data[i].name}</th>)
            }
            let tableHeader = []; //make header
            tableHeader.push(<tr key={k++} >{headerData}</tr>)
            return tableHeader
        }
        /////////////////////////////////////////////////////////////////////////////////////////
        // First Network Default
        /////////////////////////////////////////////////////////////////////////////////////////
        let tableHeader = makeHeader(this.state.NN_TableColArr1)

        let nnInfoDefault = [];
        if (this.state.NN_TableMaster == null){
            this.state.NN_TableMaster = [   {title:"Category"       , width:10    , input_data:"", ex:"ex) 업무구분(ERP, MES, SCM)"}
                                            ,{title:"SubCategory"    , width:10    , input_data:"", ex:"ex) 재무, 구매, 판매 "}
                                            ,{title:"Title"          , width:100    , input_data:"", ex:"ex) 자재 Image 분류 "}
                                            ,{title:"Description"    , width:5000    , input_data:"", ex:"ex) 자재를 Image로 분석하여 자동으로 분류함 "}
                                         ];
        }
        nnInfoDefault = this.state.NN_TableMaster

        let tableData = []
        for(let rows in this.state.NN_TableMaster){
            let colData = [];
            let row = this.state.NN_TableMaster[rows]
            colData.push(<td key={k++} style={{ "width":"20%"}}> {row["title"]} </td>)
            colData.push(<td key={k++} > < input type = {"string"} style={{"textAlign":"center", "width":"100%"}} 
                                                        defaultValue = {row["input_data"]}
                                                        maxLength = {row["width"]}  />  </td>)
            colData.push(<td key={k++} style={{"textAlign":"left", "width":"30%"}} > {row["ex"]} </td>)

            tableData.push(<tr key={k++}>{colData}</tr>)
        }

        let masterListTable = []
        masterListTable.push(<thead ref='thead' key={k++} className="center">{tableHeader}</thead>)
        masterListTable.push(<tbody ref='tbody' key={k++} className="center" >{tableData}</tbody>)
        /////////////////////////////////////////////////////////////////////////////////////////
        // Total Auto ML Default
        /////////////////////////////////////////////////////////////////////////////////////////
        let colDataAutoTotal = [];
        colDataAutoTotal.push(<td key={k++} style={{ "width":"20%", "fontWeight":"bold"}} > {"Auto Total Version"} </td>)
        colDataAutoTotal.push(<td key={k++} style={{ "width":"50%", "fontWeight":"bold"}}> {"Total Version Count : "+this.state.tVerCnt} </td>)
        colDataAutoTotal.push(<td key={k++} style={{ "width":"30%", "fontWeight":"bold", "textAlign":"left"}} > {this.state.tVerDesc} </td>)

        let masterListTableAutoTotal = []
        masterListTableAutoTotal.push(<tbody ref='tbody' key={k++} className="center" >{colDataAutoTotal}</tbody>)
        /////////////////////////////////////////////////////////////////////////////////////////
        // Second Auto ML Default
        /////////////////////////////////////////////////////////////////////////////////////////
        // let tableHeaderAuto = makeHeader(this.state.NN_TableColArr2)

        let nnInfoDefaultAuto = [];
        if (this.state.NN_TableMasterAuto == null){
            this.state.NN_TableMasterAuto = [   {title:"Generation"   , input_data:this.state.g_cnt, ex:"훈련 총 세대 Count"}
                                               ,{title:"Population"   , input_data:this.state.p_cnt, ex:"훈련 세대별 Version Count"}
                                               ,{title:"Survive"      , input_data:this.state.s_cnt, ex:"훈련 세대별 생존 Count"}
                                         ];
        }
        nnInfoDefaultAuto = this.state.NN_TableMasterAuto

        let tableDataAuto = []
        for(let rows in this.state.NN_TableMasterAuto){
            let colDataAuto = [];
            let row = this.state.NN_TableMasterAuto[rows]
            colDataAuto.push(<td key={k++} style={{ "width":"20%"}}> {row["title"]} </td>)
            colDataAuto.push(<td key={k++} > < input type = {"number"} style={{"textAlign":"center", "width":"100%"}} 
                                                        defaultValue = {row["input_data"]}
                                                        maxLength = {row["width"]} 
                                                        onChange = {this.handleChange.bind(this)} />  </td>)
            colDataAuto.push(<td key={k++} style={{"textAlign":"left", "width":"30%"}} > {row["ex"]} </td>)

            tableDataAuto.push(<tr key={k++}>{colDataAuto}</tr>)
        }

        let masterListTableAuto = []
        // masterListTableAuto.push(<thead ref='thead' key={k++} className="center">{tableHeaderAuto}</thead>)
        masterListTableAuto.push(<tbody ref='tbody' key={k++} className="center" >{tableDataAuto}</tbody>)



        // if(this.state.train_node_name != null && this.refs.trainfilesrc != null && this.state.eval_node_name != null && this.refs.evalfilesrc != null){
        //     this.refs.trainfilesrc.getFileData(null, this.state.train_node_name)
        //     this.refs.evalfilesrc.getFileData(null, this.state.eval_node_name)
        // }

        return (
            <section>
                <h1 className="hidden">tensor MSA main table</h1>
                <div className="container paddingT10">
                    <div className="tblBtnArea">
                        <button type="button" className="save" onClick={() => this.saveData()} >Save</button>
                    </div>

                    <div>
                        <h1> Network Info </h1>
                    </div>

                    <Tabs key={k++} defaultIndex={0}  onSelect={tabIndexAS => this.networkSelectTabAS({ tabIndexAS })} >
                        <TabList key={k++}>
                          <Tab key={k++}>Auto</Tab>
                          <Tab key={k++}>Single</Tab>
                        </TabList>
                        <TabPanel key={k++}>
                        </TabPanel>
                        <TabPanel key={k++}>
                        </TabPanel>
                    </Tabs>
                    
                        <div ref="masterInfo">
                            <table className="table detail" ref= 'master1' >
                                {masterListTable}
                            </table>
                        </div>

                        {this.state.autoMasterView ?
                            <div>
                                <table className="table detail" ref= 'autoTotal' >
                                    {masterListTableAutoTotal}
                                </table>
                                <table className="table detail" ref= 'master2' style={{"border-top":"1px"}} >
                                    {masterListTableAuto}
                                </table>
                            </div>
                            :
                            <div>
                            </div>
                        }
                        
                        <div>
                            <h1> Network Select </h1>
                        </div>

                        <Tabs key={k++} defaultIndex={0}  onSelect={tabIndex => this.networkSelectTab({ tabIndex })} >
                        <TabList key={k++}>
                          <Tab key={k++}>Frame</Tab>
                          <Tab key={k++}>Image</Tab>
                          <Tab key={k++}>NLP</Tab>
                        </TabList>

                            <TabPanel key={k++}>
                                <NN_InfoNewCompDetail1 ref="netDetail1" tabIndex={this.state.tabIndex}
                                                        tabIndexAS={this.state.tabIndexAS} />
                            </TabPanel>
                            <TabPanel key={k++}>
                                <NN_InfoNewCompDetail1 ref="netDetail2" tabIndex={this.state.tabIndex} 
                                                        tabIndexAS={this.state.tabIndexAS} />
                            </TabPanel> 
                            <TabPanel key={k++}>
                                <NN_InfoNewCompDetail1 ref="netDetail3" tabIndex={this.state.tabIndex} 
                                                        tabIndexAS={this.state.tabIndexAS} />
                            </TabPanel>
                        </Tabs>
                   
                    <table className="table detail">
                    <tr>
                    <td style={{"verticalAlign":"top"}}>

                        <FileUploadComponent ref="trainfilesrc" 
                                              title="Network Train Source File Upload"
                                                nn_id={this.state.tmp_train_node_name} 
                                                nn_wf_ver_id={"1"} 
                                                nn_path_type={"source"}
                                                nn_node_name={this.state.train_node_name} 
                                                uploadbtnflag={true} 
                                                deletebtnflag={true} />
                    </td>

                    <td style={{"verticalAlign":"top"}}>

                        <FileUploadComponent ref="evalfilesrc" 
                                                title="Network Eval Source File Upload"
                                                nn_id={this.state.tmp_eval_node_name} 
                                                nn_wf_ver_id={"1"} 
                                                nn_node_name={this.state.eval_node_name} 
                                                nn_path_type={"source"}
                                                uploadbtnflag={true} 
                                                deletebtnflag={true} />
                        </td>

                    </tr>
                    </table>
                    

                    

                </div>

            </section>

        );
    }
}

NN_InfoNewComponent.defaultProps = {
    reportRepository: new ReportRepository(new Api())
};




