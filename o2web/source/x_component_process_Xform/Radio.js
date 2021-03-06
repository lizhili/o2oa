MWF.xDesktop.requireApp("process.Xform", "$Input", null, false);
MWF.require("MWF.widget.UUID", null, false);
MWF.xApplication.process.Xform.Radio = MWF.APPRadio =  new Class({
	Implements: [Events],
	Extends: MWF.APP$Input,

    loadDescription: function(){},
    _loadNode: function(){
        if (this.readonly || this.json.isReadonly ){
            this._loadNodeRead();
        }else{
            this._loadNodeEdit();
        }
    },
    _loadNodeRead: function(){
        this.node.empty();
        this.node.set({
            "nodeId": this.json.id,
            "MWFType": this.json.type
        });
        var radioValues = this.getOptions();
        var value = this.getValue();
        if (value){
            var texts = "";
            for (var i=0; i<radioValues.length; i++){
                var item = radioValues[i];
                var tmps = item.split("|");
                var t = tmps[0];
                var v = tmps[1] || t;

                // if (value.indexOf(v)!=-1){
                //     texts = t;
                //     break;
                // }
                if (value == v){
                    texts = t;
                    break;
                }
            }
            this.node.set("text", texts);
        }
    },
    _resetNodeEdit: function(){
        var div = new Element("div");
        div.set(this.json.properties);
        div.inject(this.node, "after");

        this.node.destroy();
        this.node = div;
    },
    _loadNodeEdit: function(){
		//this.container = new Element("select");
        if (!this.json.preprocessing) this._resetNodeEdit();

		this.node.set({
			"id": this.json.id,
			"MWFType": this.json.type,
			"styles": {
				"display": "inline"
			}
		});
		this.setOptions();
	},
    _loadDomEvents: function(){
    },
    _loadEvents: function(){
        Object.each(this.json.events, function(e, key){
            if (e.code){
                if (this.options.moduleEvents.indexOf(key)!=-1){
                    this.addEvent(key, function(event){
                        return this.form.Macro.fire(e.code, this, event);
                    }.bind(this));
                }else{
                    //this.node.addEvent(key, function(event){
                    //    return this.form.Macro.fire(e.code, this, event);
                    //}.bind(this));
                }
            }
        }.bind(this));
    },
    addModuleEvent: function(key, fun){
        if (this.options.moduleEvents.indexOf(key)!==-1){
            this.addEvent(key, function(event){
                return (fun) ? fun(this, event) : null;
            }.bind(this));
        }else{
            var inputs = this.node.getElements("input");
            inputs.each(function(input){
                input.addEvent(key, function(event){
                    return (fun) ? fun(this, event) : null;
                }.bind(this));
            }.bind(this));
        }
    },
    resetOption: function(){
        this.node.empty();
        this.setOptions();
    },
	getOptions: function(){
		if (this.json.itemType == "values"){
			return this.json.itemValues;
		}else{
			return this.form.Macro.exec(this.json.itemScript.code, this);
		}
		return [];
	},
    setOptions: function(){
        var optionItems = this.getOptions();
        this._setOptions(optionItems);
    },

	_setOptions: function(optionItems){
        var p = o2.promiseAll(optionItems).then(function(radioValues){
            this.moduleSelectAG = null;

            if (!radioValues) radioValues = [];
            if (o2.typeOf(radioValues)==="array"){
                var flag = (new MWF.widget.UUID).toString();
                radioValues.each(function(item){
                    var tmps = item.split("|");
                    var text = tmps[0];
                    var value = tmps[1] || text;

                    var radio = new Element("input", {
                        "type": "radio",
                        "name": (this.json.properties && this.json.properties.name) ? this.json.properties.name : flag+this.json.id,
                        "value": value,
                        "showText": text,
                        "styles": this.json.buttonStyles
                    }).inject(this.node);
                    //radio.appendText(text, "after");

                    var textNode = new Element( "span", {
                        "text" : text,
                        "styles" : { "cursor" : "default" }
                    }).inject(this.node);
                    textNode.addEvent("click", function( ev ){
                        if( this.radio.get("disabled") === true || this.radio.get("disabled") === "true" )return;
                        this.radio.checked = true;
                        this.radio.fireEvent("change");
                        this.radio.fireEvent("click");
                    }.bind( {radio : radio} ) );

                    radio.addEvent("click", function(){
                        this.validationMode();
                        if (this.validation()) this._setBusinessData(this.getInputData("change"));
                    }.bind(this));

                    Object.each(this.json.events, function(e, key){
                        if (e.code){
                            if (this.options.moduleEvents.indexOf(key)!=-1){
                            }else{
                                radio.addEvent(key, function(event){
                                    return this.form.Macro.fire(e.code, this, event);
                                }.bind(this));
                            }
                        }
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this), function(){
            this.moduleSelectAG = null;
        }.bind(this));
        this.moduleSelectAG = p;
        if (p) p.then(function(){
            this.moduleSelectAG = null;
        }.bind(this), function(){
            this.moduleSelectAG = null;
        }.bind(this));

        // this.moduleSelectAG = o2.AG.all(optionItems).then(function(radioValues){
        //     this.moduleSelectAG = null;
        //
        //     if (!radioValues) radioValues = [];
        //     if (o2.typeOf(radioValues)==="array"){
        //         var flag = (new MWF.widget.UUID).toString();
        //         radioValues.each(function(item){
        //             var tmps = item.split("|");
        //             var text = tmps[0];
        //             var value = tmps[1] || text;
        //
        //             var radio = new Element("input", {
        //                 "type": "radio",
        //                 "name": (this.json.properties && this.json.properties.name) ? this.json.properties.name : flag+this.json.id,
        //                 "value": value,
        //                 "showText": text,
        //                 "styles": this.json.buttonStyles
        //             }).inject(this.node);
        //             //radio.appendText(text, "after");
        //
        //             var textNode = new Element( "span", {
        //                 "text" : text,
        //                 "styles" : { "cursor" : "default" }
        //             }).inject(this.node);
        //             textNode.addEvent("click", function( ev ){
        //                 if( this.radio.get("disabled") === true || this.radio.get("disabled") === "true" )return;
        //                 this.radio.checked = true;
        //                 this.radio.fireEvent("change");
        //                 this.radio.fireEvent("click");
        //             }.bind( {radio : radio} ) );
        //
        //             radio.addEvent("click", function(){
        //                 this.validationMode();
        //                 if (this.validation()) this._setBusinessData(this.getInputData("change"));
        //             }.bind(this));
        //
        //             Object.each(this.json.events, function(e, key){
        //                 if (e.code){
        //                     if (this.options.moduleEvents.indexOf(key)!=-1){
        //                     }else{
        //                         radio.addEvent(key, function(event){
        //                             return this.form.Macro.fire(e.code, this, event);
        //                         }.bind(this));
        //                     }
        //                 }
        //             }.bind(this));
        //         }.bind(this));
        //     }
        // }.bind(this))
        // if (this.moduleSelectAG) this.moduleSelectAG.then(function(){
        //     this.moduleSelectAG = null;
        // }.bind(this));
	},

    _setValue: function(value, m){
        var mothed = m || "__setValue";
	    if (!!value){
            var p = o2.promiseAll(value).then(function(v){
                if (o2.typeOf(v)=="array") v = v[0];
                if (this.moduleSelectAG){
                    this.moduleValueAG = this.moduleSelectAG;
                    this.moduleSelectAG.then(function(){
                        this[mothed](v);
                        return v;
                    }.bind(this), function(){});
                }else{
                    this[mothed](v)
                }
                return v;
            }.bind(this), function(){});

            this.moduleValueAG = p;
            if (this.moduleValueAG) this.moduleValueAG.then(function(){
                this.moduleValueAG = null;
            }.bind(this), function(){
                this.moduleValueAG = null;
            }.bind(this));
        }else{
            this[mothed](value);
        }


        // this.moduleValueAG = o2.AG.all(value).then(function(v){
        //     if (o2.typeOf(v)=="array") v = v[0];
        //     if (this.moduleSelectAG){
        //         this.moduleValueAG = this.moduleSelectAG;
        //         this.moduleSelectAG.then(function(){
        //             this.__setValue(v);
        //         }.bind(this));
        //     }else{
        //         this.__setValue(v)
        //     }
        //     return v;
        // }.bind(this));
        //
        // if (this.moduleValueAG) this.moduleValueAG.then(function(){
        //     this.moduleValueAG = null;
        // }.bind(this));
    },

    __setValue: function(value){
        this._setBusinessData(value);
		var radios = this.node.getElements("input");
		for (var i=0; i<radios.length; i++){
			var radio = radios[i];
			if (radio.value==value){
				radio.checked = true;
				break;
			}
		}
	},
	getTextData: function(){
		var inputs = this.node.getElements("input");
		var value = "";
		var text = "";
		if (inputs.length){
			for (var i=0; i<inputs.length; i++){
				var input = inputs[i];
				if (input.checked){
					value = input.get("value");
					text = input.get("showText");
					break;
				}
			}
		}
		return {"value": [value] || "", "text": [text || value || ""]};
	},
    getInputData: function(){
        if (this.readonly || this.json.isReadonly ){
            return this._getBusinessData();
        }else{
            var inputs = this.node.getElements("input");
            var value = "";
            if (inputs.length){
                for (var i=0; i<inputs.length; i++){
                    var input = inputs[i];
                    if (input.checked){
                        value = input.get("value");
                        break;
                    }
                }
            }
            return value;
        }
	},
    resetData: function(){
        this.setData(this.getValue());
    },
    getSelectedInput: function(){
        var inputs = this.node.getElements("input");
        if (inputs.length){
            for (var i=0; i<inputs.length; i++){
                if (inputs[i].checked) return inputs[i];
            }
        }
        return null;
    },

    setData: function(data){
        return this._setValue(data, "__setData");
        // if (data && data.isAG){
        //     this.moduleValueAG = o2.AG.all(data).then(function(v){
        //         if (o2.typeOf(v)=="array") v = v[0];
        //         this.__setData(v);
        //     }.bind(this));
        // }else{
        //     this.__setData(data);
        // }

        // if (data && data.isAG){
        //     this.moduleValueAG = data;
        //     data.addResolve(function(v){
        //         this.setData(v);
        //     }.bind(this));
        // }else{
        //     this.__setData(data);
        //     this.moduleValueAG = null;
        // }
    },

    __setData: function(data){
        this._setBusinessData(data);
		var inputs = this.node.getElements("input");
		
		if (inputs.length){
			for (var i=0; i<inputs.length; i++){
				if (data==inputs[i].get("value")){
					inputs[i].set("checked", true);
				}else{
					inputs[i].set("checked", false);
				}
			}
            this.validationMode();
		}
        this.fireEvent("setData");
	},

    notValidationMode: function(text){
        if (!this.isNotValidationMode){
            this.isNotValidationMode = true;
            this.node.store("background", this.node.getStyles("background"));
            this.node.setStyle("background", "#ffdcdc");

            this.errNode = this.createErrorNode(text);
            if (this.iconNode){
                this.errNode.inject(this.iconNode, "after");
            }else{
                this.errNode.inject(this.node, "after");
            }
            this.showNotValidationMode(this.node);

            if (!this.node.isIntoView()) this.node.scrollIntoView();
        }
    },

    validationMode: function(routeName, opinion){
        if (!this.validationConfig(routeName, opinion))  return false;

        if (this.isNotValidationMode){
            this.isNotValidationMode = false;
            this.node.setStyles(this.node.retrieve("background"));
            if (this.errNode){
                this.errNode.destroy();
                this.errNode = null;
            }
        }
    }
	
}); 
