import fs from 'fs';
import Mustache from 'mustache';
import pdf from 'html-pdf';

export const execute = async (req, res) => {

        try {

            let base64 = await generate(req);
         
            return(base64);
        }
        catch(e) {
            return e.message;
        }
}

async function generate(req){

    return new Promise(async(resolve, reject) => { 
        
        try{

            let reportParam = req;

            const defaultTemplate = "C:/etc/newnew/backend/controllers/report/templates/dataloc-report.html";

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

            let preHtml = fs.readFileSync(defaultTemplate, 'utf8');
            
            let html = Mustache.render(preHtml, reportParam);

             let base64 = await createPDF(html, options);

            resolve(base64);
        }
        catch(e){
            console.log("dataloc-create-pdf-ERR: ", e);
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
