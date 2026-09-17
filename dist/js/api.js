const STORAGE_KEY='psych-admin-api-url';
let apiUrl=localStorage.getItem(STORAGE_KEY)||'';

export const hasApi=()=>Boolean(apiUrl);
export const getApiUrl=()=>apiUrl;
export function setApiUrl(url){apiUrl=String(url||'').trim();if(apiUrl)localStorage.setItem(STORAGE_KEY,apiUrl);else localStorage.removeItem(STORAGE_KEY)}

async function request(action,{method='GET',data,params={}}={}){
  if(!apiUrl)throw new Error('API_NOT_CONFIGURED');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const query=new URLSearchParams({action,...params});
    const url=method==='GET'?`${apiUrl}${apiUrl.includes('?')?'&':'?'}${query}`:apiUrl;
    const response=await fetch(url,{method,headers:method==='POST'?{'Content-Type':'text/plain;charset=utf-8'}:undefined,body:method==='POST'?JSON.stringify({action,data}):undefined,signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP_${response.status}`);
    const result=await response.json();
    if(result.success===false)throw new Error(result.error||'API_ERROR');
    return result.data??result;
  }finally{clearTimeout(timer)}
}

export const api={
  dashboard:()=>request('dashboard'),patients:()=>request('patients'),patient:id=>request('patient',{params:{id}}),appointments:()=>request('appointments'),payments:()=>request('payments'),finance:()=>request('finance'),config:()=>request('config'),
  createPatient:data=>request('createPatient',{method:'POST',data}),updatePatient:data=>request('updatePatient',{method:'POST',data}),createAppointment:data=>request('createAppointment',{method:'POST',data}),updateAppointment:data=>request('updateAppointment',{method:'POST',data}),createPayment:data=>request('createPayment',{method:'POST',data}),updatePayment:data=>request('updatePayment',{method:'POST',data}),saveConfig:data=>request('updateConfig',{method:'POST',data})
};
