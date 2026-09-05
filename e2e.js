const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
(async()=>{
  const base='http://localhost:3000';
  console.log('1. health');
  console.log((await axios.get(base+'/api/health')).data);
  console.log('\n2. upload sample.jpg');
  const fd=new FormData();
  fd.append('image', fs.createReadStream('sample.jpg'), { filename:'sample.jpg', contentType:'image/jpeg' });
  const up=(await axios.post(base+'/api/upload', fd, { headers:fd.getHeaders(), timeout:90000, validateStatus:()=>true }));
  console.log('upload status',up.status,'body',JSON.stringify(up.data).slice(0,500));
  if(!up.data?.success){ console.log('upload fail, stop'); process.exit(1); }
  console.log('\n3. remove');
  const rm=(await axios.post(base+'/api/remove', { imageUrl: up.data.imageUrl }, { timeout:180000, validateStatus:()=>true }));
  console.log('remove status',rm.status,'body',JSON.stringify(rm.data).slice(0,800));
  if(rm.data?.success){
    console.log('\n4. poll job',rm.data.jobId);
    for(let i=0;i<10;i++){
      await new Promise(r=>setTimeout(r,4000));
      const st=(await axios.get(`${base}/api/job/${rm.data.jobId}`, { timeout:30000, validateStatus:()=>true })).data;
      console.log(`poll ${i}`,JSON.stringify(st).slice(0,600));
      if(st.outputUrl) break;
    }
  }
  console.log('\n5. frontend');
  const html=(await axios.get(base+'/', { timeout:15000 })).data;
  console.log('html len',html.length,'has Noisy?',html.includes('Noisy'),'has Hapus Watermark?',html.includes('Hapus Watermark'));
})();
