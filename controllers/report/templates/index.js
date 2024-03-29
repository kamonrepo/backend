import fs from 'fs';
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

            const defaultTemplate = "C:/etc/newnew/backend/controllers/report/templates/index-report.html";

            let preHtml = fs.readFileSync(defaultTemplate, 'utf8');

            let html = Mustache.render(preHtml, reportParam);

            let myJpeg = await convertHtmlToJpegAndSaveToFsysFolder(html, `C:/etc/newnew/backend/images/${req.accountNumber}.jpg`,`${req.accountNumber}.jpg`);

            resolve(myJpeg);
        }
        catch(e){
            console.log("ERR: ", e);
            resolve(e);
        }
    });
}


async function convertHtmlToJpegAndSaveToFsysFolder(htmlContent, filePath, fileName) {

    try {
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
      
        await page.setContent(htmlContent);

        // Ensure the directory exists
        const directory = path.dirname(filePath);

        console.error('directory directory! ', directory);
        await fs.promises.mkdir(directory, { recursive: true });

        await page.screenshot({ path: filePath, type: 'jpeg', quality: 90 });
      
        await browser.close();

        
        return { filePath , fileName };

    } catch (error) {
        console.error('Error convertHtmlToJpegAndSaveToFsysFolder', error);
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


export default execute;
