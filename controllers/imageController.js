const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

exports.processImage = async(req, res) =>{
    let outputPath = null;
    try{
        const {width, quality, format} = req.body;
        outputPath = path.join(__dirname, '../processed', `output-${Date.now()}.${format}`);

        let sharpInstance = sharp(req.file.path);
        
        // Only resize if width is provided and valid
        if (width && !isNaN(parseInt(width)) && parseInt(width) > 0) {
            sharpInstance = sharpInstance.resize({width: parseInt(width)});
        }
        
        // Apply format conversion with quality
        const qualityValue = quality ? Math.round(parseFloat(quality) * 100) : 90;
        sharpInstance = sharpInstance[format]({quality: qualityValue});
        
        await sharpInstance.toFile(outputPath);

        res.download(outputPath, (err) => {
            // Clean up file after download
            if (outputPath && fs.existsSync(outputPath)) {
                setTimeout(() => {
                    fs.unlinkSync(outputPath);
                }, 1000);
            }
        });
    }
    catch(error){
        console.log(error);
        // Clean up file on error
        if (outputPath && fs.existsSync(outputPath)) {
            try {
                fs.unlinkSync(outputPath);
            } catch (unlinkError) {
                console.log('Error cleaning up file:', unlinkError);
            }
        }
        res.status(500).json({message: "Image processing failed"});
    }
};