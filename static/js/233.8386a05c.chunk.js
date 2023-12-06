"use strict";(self.webpackChunkjs_wallet_sdk_brc20_demo=self.webpackChunkjs_wallet_sdk_brc20_demo||[]).push([[233],{5439:(e,s,t)=>{t.d(s,{M:()=>n});var l=t(4294),r=t(184);const n=e=>{let{buttonText:s,onClick:t,disabled:n=!1,testId:a=""}=e;return(0,r.jsx)(l.Z,{size:"small",variant:"contained",sx:{backgroundColor:"black",borderRadius:2},onClick:t,disabled:n,"data-testid":a,children:s})}},2713:(e,s,t)=>{t.r(s),t.d(s,{default:()=>j});var l=t(2791),r=t(7257),n=t(7621),a=t(9504),i=t(890),d=t(7924),o=t(2363),c=t(8255),x=t(4070),u=t(7317),h=t(5439),p=t(6972),b=t(184);const j=(0,r.Pi)((()=>{const[e,s]=(0,l.useState)(""),{walletStore:t,appStore:r}=(0,p.oR)(),{isInit:j,chainsAvailable:m,walletId:v,inscribeAddress:y,deployAmount:g,deployLimit:Z,deployTxHashList:k}=t,{fromAddress:C,walletId:f}=r;(0,l.useEffect)((()=>{s("")}),[j]);return j?(0,b.jsx)(b.Fragment,{children:(0,b.jsxs)(n.Z,{variant:"outlined",sx:{minWidth:275,borderRadius:5},children:[(0,b.jsx)(a.Z,{sx:{pb:1},children:(0,b.jsx)(i.Z,{sx:{fontSize:26},children:"Deploy BRC20"})}),(0,b.jsx)(d.Z,{flexItem:!0}),(0,b.jsxs)(o.Z,{sx:{pl:2,pr:2,pb:2},children:[(0,b.jsx)(c.Z,{label:"Inscribe Address",sx:{pr:1},onChange:e=>{t.setInscribeAddress(e.target.value)},value:C||y}),(0,b.jsx)(c.Z,{label:"Deploy Amount",sx:{pr:1},onChange:e=>{t.setDeployAmount(e.target.value)},type:"number",value:g}),(0,b.jsx)(c.Z,{label:"Mint Limit",sx:{pr:1},onChange:e=>{t.setDeployLimit(e.target.value)},type:"number",value:Z}),(0,b.jsx)(h.M,{buttonText:"Deploy",onClick:async()=>{try{s(""),await t.deployBRC20()}catch(e){console.error(e),s(e.toString())}},disabled:!j||0===(null===m||void 0===m?void 0:m.length)||!v&&!f,testId:"deploy-brc20"})]}),e&&(0,b.jsxs)(x.Z,{severity:"error",children:[(0,b.jsx)(u.Z,{children:"Failure"}),e]}),k&&k.length?(0,b.jsxs)(x.Z,{severity:"success",children:[(0,b.jsx)(u.Z,{children:"Success"}),(0,b.jsxs)("strong",{children:["Transaction Hashes:",k.map(((e,s)=>(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{children:`Operation: ${JSON.stringify(e.op)}`}),e.txHashList.map(((e,s)=>(0,b.jsx)("div",{children:`${e.itemId} Transaction Hash: ${e.txHash}`},`tx-${s}`)))]},`data-${s}`)))]})]}):null]},"deploy-brc20-card")}):null}))}}]);
//# sourceMappingURL=233.8386a05c.chunk.js.map