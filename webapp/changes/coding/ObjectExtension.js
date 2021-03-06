/***
@controller Name:sap.suite.ui.generic.template.ObjectPage.view.Details,
*@viewId:ui.ssuite.s2p.mm.pur.po.manage.st.s1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_PurchaseOrderTP
*/
sap.ui.define([
    'sap/ui/core/mvc/ControllerExtension',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
],
    function (
        ControllerExtension,
        Filter,
        FilterOperator
    ) {
        "use strict";

        let _oView = null;
        let _bCustomerDataLoaded = false;
        let _aCustomerData = [];

        return ControllerExtension.extend("ZMM_PCTR_ST_MTS1.ObjectExtension", {

            override: {
                /**
                 * Called when a controller is instantiated and its View controls (if available) are already created.
                 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
                 * @memberOf ZMM_PCTR_ST_MTS1.ObjectExtension
                 */
                onInit: function () {
                    // get view instance
                    _oView = this.getView();

                    setTimeout(_ => {
                        // load customer data types list
                        this._loadCustomerTypes();
                    }, 50);
                },

                /**
                 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
                 * @memberOf ZMM_PCTR_ST_MTS1.ObjectExtension
                 */
                onExit: function () {
                },

            },

            handleTabVisibility: async function (sDocumentType, sDocumentCategory) {
                // visible false by default
                let bVisible = false;

                if (!sDocumentType || !sDocumentCategory) {
                    return bVisible;
                }

                try {
                    // get all customer types
                    const aAllCustomerList = await this._loadCustomerTypes();
                    
                    for (let obj of aAllCustomerList) {
                        if (obj.documentCategory === sDocumentCategory && obj.documentType === sDocumentType) {
                            bVisible = true;
                            break;
                        }
                    }
                } catch (error) {
                    // failed to load customer types
                }

                return bVisible
            },

            /***********************************************************************/
            /*                          INTERNAL METHODS                           */
            /***********************************************************************/

            _loadCustomerTypes: function () {
                return new Promise((resolve, reject) => {
                    // customer type not loaded
                    if (_bCustomerDataLoaded) {
                        resolve(_aCustomerData);
                    } else {
                        // set customer type loaded flag to true
                        _bCustomerDataLoaded = true;

                        // filter
                        let aFilter = [];
                        aFilter.push(new Filter('variable_name', FilterOperator.EQ, 'PC_CUSTOMER_DATA'));

                        // read with filter
                        _oView.getModel("customer.customerType").read('/ZPTP_C_PROJ_TRCK_RESTRICT', {
                            filters: aFilter,
                            success: (oData) => {
                                // format to required format
                                _aCustomerData = oData.results.map(obj => {
                                    let response = {};

                                    // visible, document type and document category
                                    response.isVisible = obj.IsInvisible !== 'X';
                                    response.documentType = obj.document_type;
                                    response.documentCategory = obj.document_category;

                                    return response;
                                });

                                resolve(_aCustomerData);
                            },
                            error: (oError) => {
                                Log.error(`Failed to load data from service - ZPTP_C_PROJ_TRCK_RESTRICT_CDS - ${oError}`);
                                reject();
                            }
                        });
                    }
                });
            }

        });
    });