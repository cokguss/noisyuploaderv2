const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
(async()=>{
  const base='http://localhost:3000';
  console.log('1. health');
  console.log((await axios.get(base+'/api/health',{timeout:25000})).data);
  console.log('\n2. catbox-upload via backend (txt 5KB)');
  fs.writeFileSync('e2e-up.txt','noisy e2e '+new Date().toISOString()+'\n'.repeat(200));
  const fd=new FormData();
  fd.append('file', fs.createReadStream('e2e-up.txt'), { filename:'e2e-up.txt', contentType:'text/plain' });
  const up=(await axios.post(base+'/api/catbox-upload', fd, { headers:fd.getHeaders(), timeout:120000, maxBodyLength:Infinity, validateStatus:()=>true }));
  console.log('status',up.status);
  console.log(JSON.stringify(up.data).slice(0,600));
  if(up.data?.success){
    const head=await axios.head(up.data.url,{timeout:15000,validateStatus:()=>true});
    console.log('verify HEAD',head.status,head.headers['content-type']);
  }
  console.log('\n3. blocked ext (exe harus ditolak)');
  const fd2=new FormData();
  fd2.append('file', Buffer.from('MZ'), { filename:'jahat.exe', contentType:'application/octet-stream' });
  const b=(await axios.post(base+'/api/catbox-upload', fd2, { headers:fd2.getHeaders(), timeout:30000, validateStatus:()=>true }));
  console.log('status',b.status,JSON.stringify(b.data).slice(0,300));
  console.log('\n4. frontend');
  const html=(await axios.get(base+'/',{timeout:15000})).data;
  console.log('len',html.length,'has Uploader?',html.includes('Noisy')&&html.includes('Uploader'),'has catbox?',html.toLowerCase().includes('catbox'));
  try{fs.unlinkSync('e2e-up.txt');}catch{}
})();
