import fs from 'fs';
import path from 'path';
import pdf from 'html-pdf';
import Mustache from 'mustache';
import html2canvas from 'html2canvas';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';

export const execute = async (req, res) => {
    console.log("report-remplates-execute: ", req);
        try {

             let base64 = await generate(req);
            //const htmlFile = "C:/etc/newnew/backend/controllers/report/templates/index-report.html";
           // let base64Jpeg = await convertHtmlToBase64(htmlFile).then(base64Image => {console.log('base64Image: OK ', base64Image)}).catch(error => {console.error('base64Image: ERROR ', error)});
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

            // let base64 = await createPDF(html, options);
            let base64 = await convertHtmlToImage(fpfp);

            resolve(base64);
        }
        catch(e){
            console.log("ERR: ", e);
            resolve(e);
        }
    });
}

async function convertHtmlToImage(htmlFilePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    const fileUrl = `file://${htmlFilePath}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
    const screenshot = await page.screenshot();
    
    await browser.close();
    
    return screenshot;
  }

async function convertHtmlToBase64(htmlFilePath) {
    console.log("htmlContent-");
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    console.log("htmlContent: ", htmlContent);
  
    // Create a virtual DOM to render the HTML
    // const dom = new JSDOM(htmlContent);
    // const window = dom.window;
  
    // Use html2canvas to capture the HTML as an image
    const element = document.querySelector('body'); 
    // return html2canvas(window.document.body)
    return html2canvas(element)
      .then(canvas => {
        // Convert the canvas to a data URL (base64 encoded)
        return canvas.toDataURL('image/jpeg');
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
