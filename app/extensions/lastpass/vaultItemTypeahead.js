VaultItemTypeahead=function(a,c){TypeaheadDropdown.call(this,a,null,c);this.filter=LPTools.getOption(c,"filter",null);this.sourceFunction=LPTools.getOption(c,"sourceFunction",null);this.refresh()};VaultItemTypeahead.prototype=Object.create(TypeaheadDropdown.prototype);VaultItemTypeahead.constructor=VaultItemTypeahead;VaultItemTypeahead.prototype.refresh=function(){this.dataContainer=new Container(this.sourceFunction?this.sourceFunction():[])};
VaultItemTypeahead.prototype.buildOptions=function(a){a=a||"";var c=[];if(this.dataContainer){this.dataContainer._destructed&&this.refresh();for(var f=this.dataContainer.getSearchResultItems(a),e=0,g=f.length;e<g;++e){var b=f[e];if(!this.filter||this.filter(b)){var d=b._model.getName(),d=b instanceof AccountDisplay?d+(" ("+b._model.getUsername()+")"):d+(" ("+Strings.Vault.SECURE_NOTE+")"),b={value:b._model.getID(),label:d};0===c.length&&this.queryMatches(b,a)&&this.setHint(a,b);c.push(b)}}}this.setOptions(c);
return 0<c.length};VaultItemTypeahead.prototype.updateDropdown=function(a){this.buildOptions(a)?this.shown?this.addKeyBoardNavigation():a&&this.show():(this.hide(),this.clearHint())};
