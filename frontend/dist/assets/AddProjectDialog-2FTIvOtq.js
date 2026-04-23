import{S as N,T as $,r as g,j as r,L as b,I as w,M as Z,N as Q,B as O}from"./index-CG6olIr-.js";import{S as G,a as J,b as K,c as X,d as T,T as W}from"./IconActive-BSkg8SXS.js";const D="http://localhost:5200/api",A={async getAllProject(){const e=N.getToken();if(!e)throw new Error("No authentication token found");try{const t=await $.get(`${D}/project/getAll`,{headers:{Authorization:`Bearer ${e}`}});if(t.data.success)return t.data.pyd;throw new Error("Failed to fetch projects")}catch(t){throw console.error("Error fetching projects:",t),t}},async getProjectById(e){const t=N.getToken();if(!t)throw new Error("No authentication token found");try{const a=await $.get(`${D}/project/${e}`,{headers:{Authorization:`Bearer ${t}`}});if(a.data.success)return a.data.pyd;throw new Error("Failed to fetch project")}catch(a){throw console.error("Error fetching project:",a),a}},async createProject(e){const t=N.getToken();if(!t)throw new Error("No authentication token found");try{const a=await $.post(`${D}/project/register`,e,{headers:{Authorization:`Bearer ${t}`}});if(a.data.success)return a.data.pyd;throw new Error("Failed to create project")}catch(a){throw console.error("Error creating project:",a),a}},async updateProject(e,t){const a=N.getToken();if(!a)throw new Error("No authentication token found");try{const o=await $.patch(`${D}/project/${e}`,t,{headers:{Authorization:`Bearer ${a}`}});if(o.data.success)return o.data.pyd;throw new Error("Failed to update project")}catch(o){throw console.error("Error updating project:",o),o}},async deleteProject(e){const t=N.getToken();if(!t)throw new Error("No authentication token found");try{if(!(await $.delete(`${D}/project/${e}`,{headers:{Authorization:`Bearer ${t}`}})).data.success)throw new Error("Failed to delete project")}catch(a){throw console.error("Error deleting project:",a),a}},async runFinance(e){const t=N.getToken();if(!t)throw new Error("No authentication token found");try{const a=await $.get(`${D}/project/runFinance/${e}`,{headers:{Authorization:`Bearer ${t}`}});if(a.data.success)return a.data.pyd;throw new Error("Failed to calculate finance")}catch(a){throw console.error("Error calculating finance:",a),a}}},_e=()=>{const[e,t]=g.useState([]),[a,o]=g.useState(!0),[n,s]=g.useState(null),c=async()=>{try{o(!0);const i=(await A.getAllProject()).map(p=>({...p,budgetCount:p.lBudget?.length||0,actualCount:p.lActual?.length||0,trxCount:p.lTrx?.length||0}));t(i),s(null)}catch(d){s("Failed to fetch projects"),console.error(d)}finally{o(!1)}},u=async d=>{try{o(!0);const i=await A.getProjectById(d),p={...i,budgetCount:i.lBudget?.length||0,actualCount:i.lActual?.length||0,trxCount:i.lTrx?.length||0};return t(y=>{const j=y.findIndex(v=>v._id===d);if(j>=0){const v=[...y];return v[j]=p,v}else return[...y,p]}),s(null),p}catch(i){throw s("Failed to fetch project"),console.error(i),i}finally{o(!1)}},l=async d=>{try{const i=await A.runFinance(d),p={...i,budgetCount:i.lBudget?.length||0,actualCount:i.lActual?.length||0,trxCount:i.lTrx?.length||0};return t(y=>{const j=y.findIndex(v=>v._id===d);if(j>=0){const v=[...y];return v[j]=p,v}else return[...y,p]}),p}catch(i){throw s("Failed to calculate finance"),console.error(i),i}},m=async d=>{try{const i=await A.createProject(d),p={...i,budgetCount:i.lBudget?.length||0,actualCount:i.lActual?.length||0,trxCount:i.lTrx?.length||0};return t(y=>[p,...y]),p}catch(i){throw s("Failed to create project"),console.error(i),i}},x=async(d,i)=>{try{const p=await A.updateProject(d,i),y={...p,budgetCount:p.lBudget?.length||0,actualCount:p.lActual?.length||0,trxCount:p.lTrx?.length||0};return t(j=>j.map(v=>v._id===d?y:v)),y}catch(p){throw s("Failed to update project"),console.error(p),p}},h=async d=>{try{await A.deleteProject(d),t(i=>i.filter(p=>p._id!==d))}catch(i){throw s("Failed to delete project"),console.error(i),i}};return g.useEffect(()=>{c()},[]),{projects:e,loading:a,error:n,fetchAllProject:c,fetchProjectById:u,runFinance:l,createProject:m,updateProject:x,deleteProject:h}};let ee={data:""},te=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||ee},ae=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,re=/\/\*[^]*?\*\/|  +/g,M=/\n+/g,k=(e,t)=>{let a="",o="",n="";for(let s in e){let c=e[s];s[0]=="@"?s[1]=="i"?a=s+" "+c+";":o+=s[1]=="f"?k(c,s):s+"{"+k(c,s[1]=="k"?"":t)+"}":typeof c=="object"?o+=k(c,t?t.replace(/([^,])+/g,u=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,u):u?u+" "+l:l)):s):c!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),n+=k.p?k.p(s,c):s+":"+c+";")}return a+(t&&n?t+"{"+n+"}":n)+o},C={},R=e=>{if(typeof e=="object"){let t="";for(let a in e)t+=a+R(e[a]);return t}return e},ne=(e,t,a,o,n)=>{let s=R(e),c=C[s]||(C[s]=(l=>{let m=0,x=11;for(;m<l.length;)x=101*x+l.charCodeAt(m++)>>>0;return"go"+x})(s));if(!C[c]){let l=s!==e?e:(m=>{let x,h,d=[{}];for(;x=ae.exec(m.replace(re,""));)x[4]?d.shift():x[3]?(h=x[3].replace(M," ").trim(),d.unshift(d[0][h]=d[0][h]||{})):d[0][x[1]]=x[2].replace(M," ").trim();return d[0]})(e);C[c]=k(n?{["@keyframes "+c]:l}:l,a?"":"."+c)}let u=a&&C.g?C.g:null;return a&&(C.g=C[c]),((l,m,x,h)=>{h?m.data=m.data.replace(h,l):m.data.indexOf(l)===-1&&(m.data=x?l+m.data:m.data+l)})(C[c],t,o,u),c},oe=(e,t,a)=>e.reduce((o,n,s)=>{let c=t[s];if(c&&c.call){let u=c(a),l=u&&u.props&&u.props.className||/^go/.test(u)&&u;c=l?"."+l:u&&typeof u=="object"?u.props?"":k(u,""):u===!1?"":u}return o+n+(c??"")},"");function I(e){let t=this||{},a=e.call?e(t.p):e;return ne(a.unshift?a.raw?oe(a,[].slice.call(arguments,1),t.p):a.reduce((o,n)=>Object.assign(o,n&&n.call?n(t.p):n),{}):a,te(t.target),t.g,t.o,t.k)}let U,B,z;I.bind({g:1});let E=I.bind({k:1});function se(e,t,a,o){k.p=t,U=e,B=a,z=o}function F(e,t){let a=this||{};return function(){let o=arguments;function n(s,c){let u=Object.assign({},s),l=u.className||n.className;a.p=Object.assign({theme:B&&B()},u),a.o=/ *go\d+/.test(l),u.className=I.apply(a,o)+(l?" "+l:"");let m=e;return e[0]&&(m=u.as||e,delete u.as),z&&m[0]&&z(u),U(m,u)}return n}}var ce=e=>typeof e=="function",L=(e,t)=>ce(e)?e(t):e,ie=(()=>{let e=0;return()=>(++e).toString()})(),le=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),de=20,q="default",H=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(c=>c.id===t.toast.id?{...c,...t.toast}:c)};case 2:let{toast:o}=t;return H(e,{type:e.toasts.find(c=>c.id===o.id)?1:0,toast:o});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(c=>c.id===n||n===void 0?{...c,dismissed:!0,visible:!1}:c)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(c=>c.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(c=>({...c,pauseDuration:c.pauseDuration+s}))}}},pe=[],ue={toasts:[],pausedAt:void 0,settings:{toastLimit:de}},S={},V=(e,t=q)=>{S[t]=H(S[t]||ue,e),pe.forEach(([a,o])=>{a===t&&o(S[t])})},Y=e=>Object.keys(S).forEach(t=>V(e,t)),he=e=>Object.keys(S).find(t=>S[t].toasts.some(a=>a.id===e)),_=(e=q)=>t=>{V(t,e)},me=(e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:a?.id||ie()}),P=e=>(t,a)=>{let o=me(t,e,a);return _(o.toasterId||he(o.id))({type:2,toast:o}),o.id},f=(e,t)=>P("blank")(e,t);f.error=P("error");f.success=P("success");f.loading=P("loading");f.custom=P("custom");f.dismiss=(e,t)=>{let a={type:3,toastId:e};t?_(t)(a):Y(a)};f.dismissAll=e=>f.dismiss(void 0,e);f.remove=(e,t)=>{let a={type:4,toastId:e};t?_(t)(a):Y(a)};f.removeAll=e=>f.remove(void 0,e);f.promise=(e,t,a)=>{let o=f.loading(t.loading,{...a,...a?.loading});return typeof e=="function"&&(e=e()),e.then(n=>{let s=t.success?L(t.success,n):void 0;return s?f.success(s,{id:o,...a,...a?.success}):f.dismiss(o),n}).catch(n=>{let s=t.error?L(t.error,n):void 0;s?f.error(s,{id:o,...a,...a?.error}):f.dismiss(o)}),e};var ge=E`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,fe=E`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ye=E`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,xe=F("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${fe} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${ye} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,je=E`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,be=F("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${je} 1s linear infinite;
`,ve=E`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,we=E`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Ce=F("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ve} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${we} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ee=F("div")`
  position: absolute;
`,ke=F("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Fe=E`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ne=F("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Fe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,$e=({toast:e})=>{let{icon:t,type:a,iconTheme:o}=e;return t!==void 0?typeof t=="string"?g.createElement(Ne,null,t):t:a==="blank"?null:g.createElement(ke,null,g.createElement(be,{...o}),a!=="loading"&&g.createElement(Ee,null,a==="error"?g.createElement(xe,{...o}):g.createElement(Ce,{...o})))},De=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ae=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Se="0%{opacity:0;} 100%{opacity:1;}",Pe="0%{opacity:1;} 100%{opacity:0;}",Ie=F("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Te=F("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Be=(e,t)=>{let a=e.includes("top")?1:-1,[o,n]=le()?[Se,Pe]:[De(a),Ae(a)];return{animation:t?`${E(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${E(n)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};g.memo(({toast:e,position:t,style:a,children:o})=>{let n=e.height?Be(e.position||t||"top-center",e.visible):{opacity:0},s=g.createElement($e,{toast:e}),c=g.createElement(Te,{...e.ariaProps},L(e.message,e));return g.createElement(Ie,{className:e.className,style:{...n,...a,...e.style}},typeof o=="function"?o({icon:s,message:c}):g.createElement(g.Fragment,null,s,c))});se(g.createElement);I`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;function Oe({project:e,onSubmit:t,onCancel:a,isSubmitting:o}){const[n,s]=g.useState({code:e?.code||"",name:e?.name||"",note:e?.note||"",tags:e?.tags?e.tags.join(", "):"",active:e?.active??!0,done:e?.done??!1,typ:e?.typ||"project",year:e?.year?.toString()||new Date().getFullYear().toString(),stDate:e?.stDate||new Date().toISOString().split("T")[0],enDate:e?.enDate||new Date().toISOString().split("T")[0],client:{company:e?.client?.company||"",sub:e?.client?.sub||"",contact:e?.client?.contact||"",phone:e?.client?.phone||"",email:e?.client?.email||"",address:e?.client?.address||""}}),[c,u]=g.useState(!1),l=h=>{const{name:d,value:i}=h.target;if(d.startsWith("client.")){const p=d.split(".")[1];s(y=>({...y,client:{...y.client,[p]:i}}))}else s(p=>({...p,[d]:i}))},m=(h,d)=>{s(i=>({...i,[h]:d}))},x=h=>{if(h.preventDefault(),n.name.length>50){f.error("Name must be less than 50 characters");return}if(n.code.length>50){f.error("Code must be less than 50 characters");return}const i=Object.values(n.client).some(j=>j&&typeof j=="string"&&j.trim()!=="")?n.client:void 0,p=n.tags.split(",").map(j=>j.trim()).filter(j=>j!==""),y={...n,tags:p.length>0?p:void 0,client:i,year:n.year?parseInt(n.year):void 0,stDate:n.stDate||void 0,enDate:n.enDate||n.stDate||void 0};t(y)};return r.jsxs("form",{onSubmit:x,className:"space-y-6",children:[r.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[r.jsxs("div",{className:"space-y-2 md:col-span-2",children:[r.jsx(b,{htmlFor:"name",children:"name *"}),r.jsx(w,{id:"name",name:"name",value:n.name,onChange:l,required:!0,placeholder:"Enter project name",maxLength:50})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"code",children:"code"}),r.jsx(w,{id:"code",name:"code",value:n.code,onChange:l,placeholder:"Enter project code (optional)",maxLength:50})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"typ",children:"type"}),r.jsxs(G,{name:"typ",value:n.typ,onValueChange:h=>m("typ",h),children:[r.jsx(J,{children:r.jsx(K,{placeholder:"Select type"})}),r.jsxs(X,{children:[r.jsx(T,{value:"project",children:"project"}),r.jsx(T,{value:"routine",children:"routine"}),r.jsx(T,{value:"other",children:"other"})]})]})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"stDate",children:"start date"}),r.jsx(w,{id:"stDate",name:"stDate",type:"date",value:n.stDate,onChange:l,placeholder:"Select start date"})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"enDate",children:"end date"}),r.jsx(w,{id:"enDate",name:"enDate",type:"date",value:n.enDate,onChange:l,placeholder:"Select end date"})]}),r.jsxs("div",{className:"space-y-2 md:col-span-2",children:[r.jsx(b,{htmlFor:"note",children:"note"}),r.jsx(W,{id:"note",name:"note",value:n.note,onChange:l,placeholder:"Enter project notes"})]}),r.jsxs("div",{className:"space-y-2 md:col-span-2",children:[r.jsx(b,{htmlFor:"tags",children:"tags"}),r.jsx(w,{id:"tags",name:"tags",value:n.tags,onChange:l,placeholder:"Enter tags separated by comma (e.g. backend, api, urgent)"})]}),r.jsx("div",{className:"space-y-2 md:col-span-2 border-t pt-4",children:r.jsxs("button",{type:"button",onClick:()=>u(!c),className:"flex items-center justify-between w-full text-base font-semibold hover:text-blue-600 transition-colors",children:[r.jsx("span",{children:"Client Information"}),c?r.jsx(Z,{className:"h-5 w-5"}):r.jsx(Q,{className:"h-5 w-5"})]})}),!c&&r.jsxs(r.Fragment,{children:[r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"client.company",children:"Company"}),r.jsx(w,{id:"client.company",name:"client.company",value:n.client.company,onChange:l,placeholder:"Enter company name",maxLength:50})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"client.sub",children:"Sub Company"}),r.jsx(w,{id:"client.sub",name:"client.sub",value:n.client.sub,onChange:l,placeholder:"Enter sub company name",maxLength:50})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"client.contact",children:"Contact"}),r.jsx(w,{id:"client.contact",name:"client.contact",value:n.client.contact,onChange:l,placeholder:"Enter contact person"})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"client.phone",children:"Phone"}),r.jsx(w,{id:"client.phone",name:"client.phone",value:n.client.phone,onChange:l,placeholder:"Enter phone number"})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"client.email",children:"Email"}),r.jsx(w,{id:"client.email",name:"client.email",type:"email",value:n.client.email,onChange:l,placeholder:"Enter email address"})]}),r.jsxs("div",{className:"space-y-2",children:[r.jsx(b,{htmlFor:"client.address",children:"Address"}),r.jsx(W,{id:"client.address",name:"client.address",value:n.client.address,onChange:l,placeholder:"Enter address",maxLength:100})]})]}),r.jsx("div",{className:"space-y-2 md:col-span-2",children:r.jsxs("div",{className:"flex items-center space-x-4",children:[r.jsxs("div",{className:"flex items-center space-x-2",children:[r.jsx("input",{id:"active",name:"active",type:"checkbox",checked:n.active,onChange:h=>s(d=>({...d,active:h.target.checked})),className:"h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"}),r.jsx(b,{htmlFor:"active",children:"Active"})]}),r.jsxs("div",{className:"flex items-center space-x-2",children:[r.jsx("input",{id:"done",name:"done",type:"checkbox",checked:n.done,onChange:h=>s(d=>({...d,done:h.target.checked})),className:"h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"}),r.jsx(b,{htmlFor:"done",children:"Done"})]})]})})]}),r.jsxs("div",{className:"flex justify-end space-x-3",children:[r.jsx(O,{type:"button",variant:"outline",onClick:a,disabled:o,children:"Cancel"}),r.jsx(O,{type:"submit",disabled:o,children:o?"Saving...":e?"Update Project":"Create Project"})]})]})}export{Oe as A,A as p,_e as u};
