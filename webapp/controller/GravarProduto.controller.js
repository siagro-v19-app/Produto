sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecProdutos/helpers/UnidadeMedidaHelpDialog",
	"br/com/idxtecProdutos/helpers/ContaContabilHelpDialog",
	"br/com/idxtecProdutos/helpers/ItemContabilHelpDialog",
	"br/com/idxtecProdutos/services/Session"
], function(Controller, History, MessageBox, JSONModel, UnidadeMedidaHelpDialog, ContaContabilHelpDialog,
	ItemContabilHelpDialog, Session) {
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
		
		unidadeMedidaReceived: function() {
			this.getView().byId("unidade").setSelectedKey(this.getModel("model").getProperty("/UnidadeMedida"));
		},
		
		contaContabilReceived: function() {
			this.getView().byId("contacontabil").setSelectedKey(this.getModel("model").getProperty("/ContaContabil"));
		},
		
		itemContabilReceived: function() {
			this.getView().byId("itemcontabil").setSelectedKey(this.getModel("model").getProperty("/ItemContabil"));
		},
		
		handleSearchUnidade: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			UnidadeMedidaHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchConta: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ContaContabilHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchItem: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ItemContabilHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view"); 
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("unidade").setValue("");
			this.getView().byId("contacontabil").setValue("");
			this.getView().byId("itemcontabil").setValue("");
			
			if(this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Novo Produto"	
				});
				
				var oNovoProduto = {
					"Id": 0,
					"Codigo": "",
					"Descricao": "",
					"UnidadeMedida": 0,
					"ContaContabil": "",
					"ItemContabil": 0,
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoProduto);
				
			} else if(this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Produto"	
				});
				
				oModel.read(oParam.sPath, {
					success: function(oData){
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if(this._operacao === "incluir"){
				this._createProduto();
			}else if(this._operacao === "editar"){
				this._updateProduto();
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.ItemContabil = oDados.ItemContabil ? oDados.ItemContabil : 0;
			
			oDados.UnidadeMedidaDetails = {
				__metadata: {
					uri: "/UnidadeMedidas(" + oDados.UnidadeMedida + ")"
				}
			};
			
			oDados.PlanoContaDetails = {
				__metadata: {
					uri: "/PlanoContas('" + oDados.ContaContabil + "')"
				}
			};
			
			oDados.ItemContabilDetails = {
				__metadata: {
					uri: "/ItemContabils(" + oDados.ItemContabil + ")"
				}
			};
			
			return oDados;
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("produtos", {}, true);
			}
		},
		
		_createProduto: function(){
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			
			oModel.create("/Produtos", this._getDados(), {
				success: function() {
					MessageBox.success("Produto inserido com sucesso.", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_updateProduto: function(){
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
				success: function(){
					MessageBox.success("Produto alterado com sucesso.", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("descricao").getValue() === ""
			|| oView.byId("unidade").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack(); 
		}
	});
});