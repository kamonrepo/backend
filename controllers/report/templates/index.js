import fs from 'fs';
import pdf from 'html-pdf';
import Mustache from 'mustache';
import puppeteer from 'puppeteer';
import path from 'path'

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

             //let base64 = await createPDF(html, options);
             let base64 = await convertHtmlToBase64(html);

             //jpeg 
             let myFilename = `../../../reports/jpeg/${req.accountNumber}.jpg`;
             console.log('myFilename::: ', myFilename);

             let myJpeg = await convertHtmlToJpeg(html, `fsys/jpeg/${req.accountNumber}.jpg`);


            resolve(base64);
        }
        catch(e){
            console.log("ERR: ", e);
            resolve(e);
        }
    });
}

async function convertHtmlToJpeg(htmlContent, fileName) {

    try {
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
      
        await page.setContent(htmlContent);

        // Ensure the directory exists
        const directory = path.dirname(fileName);

        //fs.mkdir(directory, { recursive: true });
        // Use promise-based version of fs.mkdir
        await fs.promises.mkdir(directory, { recursive: true });

        await page.screenshot({ path: fileName, type: 'jpeg', quality: 90 });
      
        await browser.close();

    } catch (error) {
        console.error('Error converting HTML to Jpeg:', error);
        throw error;
    }

}

async function convertHtmlToBase64(htmlContent) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);

         const screenshot = await page.screenshot({ encoding: 'base64' });
        //const screenshot = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 70 });

        await browser.close();
        return screenshot;
    } catch (error) {
        console.error('Error converting HTML to base64:', error);
        throw error;
    }
}

// async function convertHtmlToBase64(htmlContent) {
//     try {

//         const dom = new JSDOM(htmlContent);
//         const canvas = await html2canvas(dom.window.document.body);
//         const base64Image = canvas.toDataURL('image/jpeg');
//         return base64Image;

//     } catch (error) {
//         console.error('Error converting HTML to base64:', error);
//         throw error;
//     }
// }

// async function convertHtmlToBase64(htmlContent) {
//     try {
//       const canvas = await html2canvas(htmlContent);
//       const base64Image = canvas.toDataURL('image/jpeg');
//       return base64Image;
//     } catch (error) {
//       console.error('Error converting HTML to base64:', error);
//       throw error;
//     }
// }

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
