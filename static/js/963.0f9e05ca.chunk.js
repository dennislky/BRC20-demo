"use strict";(self.webpackChunkjs_wallet_sdk_brc20_demo=self.webpackChunkjs_wallet_sdk_brc20_demo||[]).push([[963],{5439:(e,l,s)=>{s.d(l,{M:()=>a});var t=s(4294),r=s(184);const a=e=>{let{buttonText:l,onClick:s,disabled:a=!1,testId:d=""}=e;return(0,r.jsx)(t.Z,{size:"small",variant:"contained",sx:{backgroundColor:"black",borderRadius:2},onClick:s,disabled:a,"data-testid":d,children:l})}},963:(e,l,s)=>{s.r(l),s.d(l,{default:()=>b});var t=s(2791),r=s(7257),a=s(7621),d=s(9504),i=s(890),n=s(7924),c=s(2363),o=s(4070),x=s(7317),h=s(5439),u=s(6954),j=s(184);const b=(0,r.Pi)((()=>{const[e,l]=(0,t.useState)(""),{walletStore:s,appStore:r}=(0,u.oR)(),{isInit:b,chainsAvailable:w,walletId:v,walletInfos:p}=s,{walletId:k}=r;(0,t.useEffect)((()=>{l("")}),[b]);return b?(0,j.jsx)(j.Fragment,{children:(0,j.jsxs)(a.Z,{variant:"outlined",sx:{minWidth:275,borderRadius:5},children:[(0,j.jsx)(d.Z,{sx:{pb:1},children:(0,j.jsx)(i.Z,{sx:{fontSize:26},children:"Create Wallet"})}),(0,j.jsx)(n.Z,{flexItem:!0}),(0,j.jsx)(c.Z,{sx:{pl:2,pr:2,pb:2},children:(0,j.jsx)(h.M,{buttonText:"Create Wallet",onClick:async()=>{try{l(""),await s.createWallet()}catch(e){console.error(e),l(e.toString())}},disabled:!b||0===(null===w||void 0===w?void 0:w.length)||!!v||!!k||!p.length,testId:"create-wallet"})}),e&&(0,j.jsxs)(o.Z,{severity:"error",children:[(0,j.jsx)(x.Z,{children:"Failure"}),e]}),v?(0,j.jsxs)(o.Z,{severity:"success",children:[(0,j.jsx)(x.Z,{children:"Wallet Created Successfully"}),(0,j.jsxs)("div",{children:["Wallet ID: ",v]}),(0,j.jsx)("br",{}),(0,j.jsxs)("div",{children:["BTC Address Binded: ",(0,j.jsx)("br",{}),p.map(((e,l)=>(0,j.jsx)("div",{children:(0,j.jsx)("div",{children:`${e.segwitType?`${e.segwitType}: `:"legacy: "}${e.address}`})},`walletInfo-${l}`)))]})]}):null]},"create-wallet-card")}):null}))}}]);
//# sourceMappingURL=963.0f9e05ca.chunk.js.map