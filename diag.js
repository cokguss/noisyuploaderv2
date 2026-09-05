const axios = require('axios');
const FormData = require('form-data');
function genSerial(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;const v=c==='x'?r:(r&0x3|0x8);return v.toString(16);}); }
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';
(async()=>{
  // 1. cek upload endpoint (harus cepat 200)
  try{
    const f=new FormData(); f.append('file_name','cek.jpg');
    const t0=Date.now();
    const r=await axios.post('https://api-v2.imgupscaler.ai/api/common/upload/upload-image', f, { headers:{'User-Agent':UA,'Origin':'https://magiceraser.org','Referer':'https://magiceraser.org/',...f.getHeaders()}, timeout:25000, validateStatus:()=>true });
    console.log(`UPLOAD ${(Date.now()-t0)/1000}s`, r.status, JSON.stringify(r.data).slice(0,300));
  }catch(e){ console.log('UPLOAD ERR', e.code||e.message); }
  // 2. cek create-job dengan URL dummy (kalau API hidup harus balas cepat 300003/300008, bukan timeout)
  try{
    const hb={'User-Agent':UA,'Origin':'https://magiceraser.org','Referer':'https://magiceraser.org/','Product-Code':'magiceraser','Product-Serial':genSerial(),'router-key':'me_remove_watermark_v1'};
    const form=new FormData();
    form.append('prompt','test');
    form.append('original_image_url','https://example.com/x.jpg');
    form.append('resolution','0.8');
    form.append('output_format','jpg');
    const t0=Date.now();
    const r=await axios.post('https://api-v2.imgupscaler.ai/api/runtime/jobs/create-job', form, { headers:{...hb,...form.getHeaders()}, timeout:35000, validateStatus:()=>true });
    console.log(`CREATE ${(Date.now()-t0)/1000}s`, r.status, JSON.stringify(r.data).slice(0,400));
  }catch(e){ console.log('CREATE ERR', e.code||e.message); }
  // 3. cek proxy source
  try{
    const t0=Date.now();
    const r=await axios.get('https://api.ikyyxd.my.id/v2l/proxy-free/ikyy-xsample',{timeout:15000});
    console.log(`PROXY ${(Date.now()-t0)/1000}s count=${r.data.length}`);
  }catch(e){ console.log('PROXY ERR', e.code||e.message); }
})();
