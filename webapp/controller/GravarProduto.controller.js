sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function(Controller, History, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("br.com.idxtecProdutos.controller.GravarProduto", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarproduto").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel, "model");
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			if(this._operacao === "incluir"){
				var oNovoProduto = {
					"Id": 0,
					"Codigo": "",
					"Descricao": "",
					"UnidadeMedida": 0
				};
				
				oJSONModel.setData(oNovoProduto);
				
				this.getView().byId("unidade").setSelectedKey("");
			} else if(this._operacao === "editar"){
				oModel.read(oParam.sPath, {
					success: function(oData){
						oJSONModel.setData(oData);
					},
					error: function(oError){
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (this._checarCampos(this.getView())) {
				MessageBox.information("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if(this._operacao === "incluir"){
				this._createProduto();
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					oRouter.navTo("produtos", {}, true);
				}
			}else if(this._operacao === "editar"){
				this._updateProduto();
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					oRouter.navTo("produtos", {}, true);
				}
			}
		},
		
		_createProduto: function(){
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oDados.UnidadeMedida = parseInt(oDados.UnidadeMedida, 0);
			oDados.UnidadeMedidaDetails = {
				__metadata: {
					uri: "/UnidadeMedidas(" + oDados.UnidadeMedida + ")"
				}
			};
			oModel.create("/Produtos", oDados, {
				success: function() {
					MessageBox.success("Produto inserido com sucesso.");
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateProduto: function(){
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oDados.UnidadeMedida = parseInt(oDados.UnidadeMedida, 0);
			oDados.UnidadeMedidaDetails = {
				__metadata:{
					uri: "/UnidadeMedidas(" + oDados.UnidadeMedida + ")"
				}
			};
			
			oModel.update(this._sPath, oDados, {
				success: function(){
					MessageBox.success("Produto alterado com sucesso.");
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("descricao").getValue() === ""
			|| oView.byId("unidade").getSelectedItem() === null){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
		
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("produtos", {}, true);
			}
		}
	});

});