import template from '../report/templates/index.js';

const generateDoc = async (reqBody, res) => {
    try {

        let base64 = await template(reqBody);
        return base64; 
    }
    catch(e) {
        return e;
    }

}

export const generate = async (req, res) => {
    try {

        console.log('generateDoc-req: ', req.body);
        let ret = await generateDoc(req.body)

        res.status(200).json(ret);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// export default generate;
