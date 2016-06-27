function upload_rsa_keys(a,b,c,e){if(lploggedin){e="undefined"==typeof forcewriteprivatearg||0==forcewriteprivatearg?0:forcewriteprivatearg;c?console_log("RSA : upload_rsa_keys : from="+a+" : getting rsa keys from server : forcewriteprivate="+e):console_log("RSA : upload_rsa_keys : from="+a+" : created new rsa keys and uploading to server : forcewriteprivate="+e);var d=a="";c?console_log("RSA : upload_rsa_keys : NOT wrapping and CBC encrypting privatekey -- that should have already been done"):(console_log("RSA : upload_rsa_keys : wrapping and CBC encrypting privatekey"),
a="undefined"!=typeof b.publickey?b.publickey:encode_public_key(b),d=rsa_encrypt_privatekey("undefined"!=typeof b.privatekey?b.privatekey:encode_private_key(b),g_local_key));b=g_local_key;c="";null!=b&&""!=b&&(c=AES.bin2hex(b),c=c.toUpperCase());b=""==c?"":SHA256(c);c=""==c?"":SHA256(d);console_log("RSA : upload_rsa_keys : -- uploading privatekeyenchexhash="+c);console_log("RSA : upload_rsa_keys : -- uploading publickey="+a);d="privatekeyenc="+LP.en(d);d+="&publickey="+LP.en(a);d+="&forcewriteprivate="+
LP.en(e);d+="&userkeyhexhash="+LP.en(b);d+="&privatekeyenchexhash="+LP.en(c);d+="&from="+LP.en("crplugin");lpMakeRequest(base_url+"uploadrsakeys.php",d,upload_rsa_keys_response,null)}else console_log("RSA : upload_rsa_keys : from="+a+" : returning because we are not logged in")}
function upload_rsa_keys_response(a){if(4==a.readyState&&200==a.status&&a.responseXML&&a.responseXML.documentElement){a=a.responseXML.documentElement.getElementsByTagName("ok");var b="";0<a.length&&(b=a[0].getAttribute("privatekeyenchex"),console_log("RSA : upload_rsa_keys_response : got uploadrsakeys response : server returned privatekeyenchex="+b),null!=b&&""!=b&&(console_log("RSA : upload_rsa_keys_response : calling writersaprivatekeyenchextodb()"),writersaprivatekeyenchextodb(b),console_log("RSA : upload_rsa_keys_response : calling readrsaprivatekeyhexfromdb()"),
readrsaprivatekeyhexfromdb(!0,null,null,function(){g_shares&&0<g_shares.length&&(console_log("RSA : upload_rsa_keys_response found shares: reparse!"),get_accts_local(!0,"refetchsharing"))})))}}function writersaprivatekeyenchextodb(a){console_log("RSA : writersaprivatekeyenchextodb : writing privatekeyenchex to db");null==g_username||""==g_username?console_log("RSA : writersaprivatekeyenchextodb : FAILED because g_username is blank"):lpSaveData(a,"rsakey")}
function readrsaprivatekeyhexfromdb(a,b,c,e){if(g_nosharingkeys)console_log("RSA : readrsaprivatekeyhexfromdb : FAILED because g_nosharingkeys==TRUE");else if(null==g_username||""==g_username||null==g_local_key)console_log("RSA : readrsaprivatekeyhexfromdb : FAILED because g_username is blank");else if(("undefined"==typeof a||!a)&&""!=lp_rsaprivatekeyhex&&(!c||SHA256(lp_rsaprivatekeyenchex)==c))console_log("RSA : readrsaprivatekeyhexfromdb : returning a cached value"),console_log("RSA : readrsaprivatekeyhexfromdb : -- lp_rsaprivatekeyhex="+
lp_rsaprivatekeyhex),console_log("RSA : readrsaprivatekeyhexfromdb : -- SHA256(lp_rsaprivatekeyenchex)="+SHA256(lp_rsaprivatekeyenchex)),console_log("RSA : readrsaprivatekeyhexfromdb : --               comparetohash="+c),e&&e(lp_rsaprivatekeyhex);else if(rsa_clearvars(),console_log("RSA : readrsaprivatekeyhexfromdb : trying to read from db"),a=opendb(),createDataTable(a),a){var d=function(a,d){if(0<d.rows.length){var f=d.rows.item(0).data;if(""==f||null==f)console_log("RSA : readrsaprivatekeyhexfromdb : FAILED to find in db"),
DeleteFromDB("rsakey");else if(c&&SHA256(f)!=c)console_log("RSA : readrsaprivatekeyhexfromdb : found in db, but hash does not match!"),console_log("RSA : readrsaprivatekeyhexfromdb : -- datahex="+f),console_log("RSA : readrsaprivatekeyhexfromdb : -- SHA256(datahex)="+SHA256(f)),console_log("RSA : readrsaprivatekeyhexfromdb : --   comparetohash="+c),DeleteFromDB("rsakey"),0==g_privkeyattempts?(console_log("RSA : readrsaprivatekeyhexfromdb : GET IT FROM THE SERVER A"),g_privkeyattempts=1,setTimeout(function(){console.error("BAH!!!");
upload_rsa_keys("GetA",null,!0)},500)):console_log("RSA : readrsaprivatekeyhexfromdb : NOT GETTING IT FROM THE SERVER BECAUSE g_privkeyattempts="+g_privkeyattempts);else{console_log("RSA : readrsaprivatekeyhexfromdb : found it in the db: datahex="+f);console_log("RSA : readrsaprivatekeyhexfromdb : trying to decrypt using CBC");var h=rsa_extract_privatekey(f,g_local_key);h?(console_log("RSA : readrsaprivatekeyhexfromdb : successfully decrypted using CBC and extracted plaintext private key"),lp_rsaprivatekeyenchex=
f,lp_rsaprivatekeyhex=h,lp_rsaprivatekeyenchexserverhash=SHA256(lp_rsaprivatekeyenchex),console_log("RSA : readrsaprivatekeyhexfromdb : SUCCESS"),console_log("RSA : readrsaprivatekeyhexfromdb : -- setting lp_rsaprivatekeyhex="+lp_rsaprivatekeyhex),console_log("RSA : readrsaprivatekeyhexfromdb : -- setting lp_rsaprivatekeyenchexserverhash="+lp_rsaprivatekeyenchexserverhash),e&&e(lp_rsaprivatekeyhex),g_shares&&(1==g_shares.length&&0==g_shares[0].id)&&(console_log("RSA : readrsaprivatekeyhexfromdb : Shared folder found, we just got the key, reparse!"),
get_accts_local())):(console_log("RSA : readrsaprivatekeyhexfromdb : FAILED to decrypt/extract private key : decryptedbin.length="+decryptedbin.length),lpReportError("readrsaprivatekeyhexfromfile : failed to extract rsa key from file - did we change our password on another PC? datahex.length="+f.length+" decryptedbin.length="+decryptedbin.length),DeleteFromDB("rsakey"))}}else console_log("RSA : readrsaprivatekeyhexfromdb : FAILED to find in db"),b&&(console_log("RSA : readrsaprivatekeyhexfromdb : GET IT FROM THE SERVER B"),
upload_rsa_keys("GetB",null,!0))};if(g_indexeddb){var f={rows:{item:function(a){return this[a]},length:0}};a.transaction("LastPassData","readonly").objectStore("LastPassData").openCursor(IDBKeyRange.only(db_prepend(g_username_hash)+"_rsakey")).onsuccess=function(a){(a=a.target.result)?(f.rows[f.rows.length]=a.value,f.rows.length++,a["continue"]()):d(null,f)}}else a.transaction(function(a){a.executeSql("SELECT * FROM LastPassData WHERE username_hash=? AND type=?",[db_prepend(g_username_hash),"rsakey"],
d,function(a,b){console_log(b)})})}}function rsa_userchangedpassword(){console_log("rsa_userchangedpassword : called");DeleteFromDB("rsakey");rsa_clearvars()}function rsa_clearvars(){console_log("rsa_clearvars : called");lp_rsaprivatekeyenchexserverhash=lp_rsaprivatekeyenchex=lp_rsaprivatekeyhex=""}var lppendingsharests=0;function rsa_setpendingsharests(a){lppendingsharests="undefined"!=typeof a&&a?0:(new Date).getTime()}
function rsa_acceptpendingshares(a){if(lploggedin&&!(lploggedinoffline||null==g_local_key))if(""!=lp_rsaprivatekeyhex){if(rsaprivatekeyhex=lp_rsaprivatekeyhex,0!=g_pendings.length)if(1E4>(new Date).getTime()-lppendingsharests)console_log("lprsa_acceptpendingshares : skipping because we were already called very recently");else{rsa_setpendingsharests();a=[];for(var b in g_pendings){var c=g_pendings[b];if(1==c.shareautoaccept){var e="",e="";if(have_nplastpass()&&"function"==typeof g_nplastpass.xCryptoRSADecrypt)e=
g_nplastpass.xCryptoRSADecrypt(rsaprivatekeyhex,c.sharekeyenchex),e=AES.hex2bin(e);else{e=new RSAKey;if(!parse_private_key(e,lp_rsaprivatekeyhex)){console_error("Private key could not be parsed while auto accepting shares");return}e=e.decrypt(c.sharekeyenchex);AES.bin2hex(e)}if(""==e){console_error("Share key bin empty while auto accepting shares");return}var d=dec(c.sharename,e),f=dec(c.sharegroup,e),j=dec(c.username,e),g=dec(c.password,e),k=dec(c.extra,e),h=!0,l={};for(b in c.shareafids)if(l[b]=
dec(c.shareafids[b],e),""!=c.shareafids[b]&&""==l[b]){h=!1;break}if(""!=c.sharename&&""==d||""!=c.sharegroup&&""==f||""!=c.username&&""==j||""!=c.password&&""==g||""!=c.extra&&""==k||!h)lpReportError("lprsa_acceptpendingshares : failing autoaccept of share because we failed to decrypt at least one value");else{var m=lpenc(d),n=lpenc(f),p=lpenc(j),q=lpenc(g),r=lpenc(k),h=!0,e={};for(b in l)if(e[b]=lpenc(l[b]),""!=l[b]&&""==e[b]){h=!1;break}if(""!=d&&""==m||""!=f&&""==n||""!=j&&""==p||""!=g&&""==q||
""!=k&&""==r||!h)lpReportError("lprsa_acceptpendingshares : failing autoaccept of share because we failed to reencrypt at least one value");else{c={aid:c.id,name:m,group:n,username:p,password:q,extra:r};d=0;for(b in e)c["afid"+d]=b,c["afidv"+d]=e[b],++d;c.numafids=d;a.push(c)}}}}if(0<a.length){c="cmd="+LP.en("autoacceptshares")+"&from="+LP.en("crplugin")+"&numshares="+LP.en(a.length);e=0;for(b in a){d="&share"+e;++e;for(var s in a[b])c+=d+s+"="+LP.en(a[b][s])}console_log("rsa_acceptpendingshares : issuing server request to autoaccept "+
a.length+" shares");lpMakeRequest(base_url+"showacceptshare.php",c,rsa_acceptpendingsharesresponse)}else console_log("rsa_acceptpendingshares : no shares to autoaccept so not issuing server request")}}else a||(console_log("RSA : rsa_acceptpendingshares : calling readrsaprivatekeyhexfromdb()"),readrsaprivatekeyhexfromdb(!1,null,null,rsa_acceptpendingshares))}
function rsa_acceptpendingsharesresponse(a){if(4==a.readyState)if(console_log("rsa_acceptpendingsharesresponse : received response from server"),200!=a.status)lpReportError("lprsa_acceptpendingsharesresponse : request failed status="+a.status);else if(null==a.responseXML||null==a.responseXML.documentElement)lpReportError("lprsa_acceptpendingsharesresponse : request failed xml invalid A text="+a.responseText);else{var b=a.responseXML.documentElement.getElementsByTagName("ok");!b||0==b.length?lpReportError("lprsa_acceptpendingsharesresponse : request failed xml invalid B text="+
a.responseText):get_accts()}}function rsa_setshareeautopushests(a){g_shareeautopushests="undefined"!=typeof a&&a?0:(new Date).getTime()}
function rsa_acceptshareeautopushes(){var a=!1,b;for(b in g_shareeautopushes){a=!0;break}if(a&&lploggedin&&!(lploggedinoffline||null==g_local_key)&&!(1E4>(new Date).getTime()-lpshareeautopushests))rsa_setshareeautopushests(),console_log("RSA : rsa_acceptshareeautopushes : calling readrsaprivatekeyhexfromdb()"),readrsaprivatekeyhexfromdb(!1,null,null,rsa_acceptshareeautopushes2)}
function rsa_acceptshareeautopushes2(a){var b=[],c;for(c in g_shareeautopushes)for(var e in g_shareeautopushes[c]){var d=g_shareeautopushes[c][e],f="";if(have_nplastpass()&&"function"==typeof g_nplastpass.xCryptoRSADecrypt)f=g_nplastpass.xCryptoRSADecrypt(a,d.sharekeyhexenc),f=AES.hex2bin(f);else{f=new RSAKey;if(!parse_private_key(f,a)){console_error("Private key could not be parsed while auto accepting shares");return}f=f.decrypt(d.sharekeyhexenc)}""==f||null==f||(d=reencryptShareeAutoPushes(f,d,
c),null!=d&&("undefined"==typeof b[c]&&(b[c]=[]),b[c].push(d)))}a="cmd="+LP.en("updateautoshareepushes")+"&from="+LP.en("ffplugin");f=e=0;for(c in b){++e;for(var j in b[c]){var g="&share"+f,d=b[c][j],k;for(k in d)a+=g+k+"="+LP.en(d[k]);++f}}a+="&numupdates="+LP.en(f);0<f?(lplastgetaccounts=0,lpMakeRequest(base_url+"showacceptshare.php",a,rsa_acceptshareeautopushesresponse)):lpdbg("sharing","lprsa_acceptshareeautopushes : no shareeautopushes so not issuing server request")}
function rsa_acceptshareeautopushesresponse(a){if(4==a.readyState)if(lpdbg("sharing","lprsa_acceptshareeautopushesresponse : received response from server"),200!=a.status)lpReportError("lprsa_acceptshareeautopushesresponse : request failed status="+a.status);else if(null==a.responseXML||null==a.responseXML.documentElement)lpReportError("lprsa_acceptshareeautopushesresponse : request failed xml invalid A text="+a.responseText);else{var b=a.responseXML.documentElement.getElementsByTagName("ok");!b||
0==b.length?lpReportError("lprsa_acceptshareeautopushesresponse : request failed xml invalid B text="+a.responseText):get_accts()}}
function rsa_shareeautopushesresponse(a,b){if(4!=a.readyState||200!=a.status||null==a.responseXML||null==a.responseXML.documentElement||"undefined"==typeof b||null==b)return!1;var c=(new Date).getTime(),e=b.url,d=b.aid,f=b.handler,j=b.param,g=b.postdata,g="undefined"!=typeof b.acct?b.acct:null;null==g&&(g="undefined"!=typeof g_sites[d]?g_sites[d]:"undefined"!=typeof g_securenotes[d]?g_securenotes[d]:null);null==g&&(g={name:"",group:"",username:"",password:"",extra:""});g=createShareeAutoPushesResponse(a,
b,g);if(!1==g)return!1;c=((new Date).getTime()-c)/1E3;lpdbg("sharing","Finished RSA encryption. Total time taken = "+c+" seconds");lpdbg("sharing","Reissuing request to "+e+" with postdata="+g);lplastgetaccounts=0;lpMakeRequest(e,g,f,null,j||b);return!0}
function lprsa_encryptdata(a,b){var c=null;if(have_nplastpass()&&"function"==typeof g_nplastpass.xCryptoRSAEncrypt)c=g_nplastpass.xCryptoRSAEncrypt(a,b);else{c=new RSAKey;if(!parse_public_key(c,a))return console_error("Private key could not be parsed while auto accepting shares"),!1;c=c.encrypt(AES.hex2bin(b))}return""!=b&&(null==c||""==c)?(lpReportError("lprsa_encryptdata : Failed to rsaencrypt data using publickeyhex="+a),!1):c}
function lprsa_rsadecrypt(a){if(""==lp_rsaprivatekeyhex)return null;if(have_nplastpass()&&"function"==typeof g_nplastpass.xCryptoRSADecrypt)a=g_nplastpass.xCryptoRSADecrypt(lp_rsaprivatekeyhex,a);else{var b=new RSAKey;if(!parse_private_key(b,lp_rsaprivatekeyhex))return null;a=b.decrypt(a);a=AES.bin2hex(a).toUpperCase()}return a}
function lprsa_encryptmultiple(a){a=JSON.parse(a);for(var b=0;b<a.length;++b){if("undefined"==typeof a[b].valuehex||"undefined"==typeof a[b].publickeyhex||""==a[b].publickeyhex)return null;if(have_nplastpass()&&"function"==typeof g_nplastpass.xCryptoRSAEncrypt)a[b].valuehexenc=g_nplastpass.xCryptoRSAEncrypt(a[b].publickeyhex,a[b].valuehex);else{var c=new RSAKey;if(!parse_public_key(c,a[b].publickeyhex))return null;a[b].valuehexenc=c.encrypt(AES.hex2bin(a[b].valuehex)).toUpperCase()}if(""==a[b].valuehexenc||
null==a[b].valuehexenc)return null}return JSON.stringify(a)};
