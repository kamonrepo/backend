import fs from 'fs';
import pdf from 'html-pdf';
import Mustache from 'mustache';

export const execute = async (req, res) => {
    console.log("executeexecuteexecute: ", req);
        try {
            let base64 = await generate(req);
            return(base64);

        }
        catch(e) {
            return e.message;
        }
}



async function generate(req){
    console.log("reqreqreqreqreq: ", req);
    return new Promise(async(resolve, reject) => { 
        
        try{

            let reportParam = req;
            let options = { 
                "orientation": "portrait",
                "header": {
                    "height": "13mm",
                    "contents": {}
                },
                "footer": {
                    "height": "20mm",
                    "contents": {}
                },
            };

            const fpfp = "C:/etc/newnew/backend/controllers/report/templates/index-report.html";

            let preHtml = fs.readFileSync(fpfp, 'utf8');
            
            let html = Mustache.render(preHtml, reportParam);
            html = html.replaceAll('--tempPlaceholder--', '{{tph}}').toString();

            let base64 = await createPDF(html, options);

            resolve(base64);

        }
        catch(e){
            console.log("ERR: ", e);
            resolve(e);
        }
    });
}

function createPDF(html, options){
	return new Promise((res, rej) => {
        try {
            pdf.create(html, options).toBuffer(function(err, buffer){
                if (err){
                    console.log('svc-generator : Document creation failed');
                    console.log("ERROR: " + err);
                    rej(err);
                } else {
                    var base64Encoded = buffer.toString('base64');
                    console.log('svc-generator : Document creation successful');
                    res(base64Encoded);
                }
            });
        } catch (e) {
            console.log(e);
            rej(e);
        }
    })   
}

export default execute;
