const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

class PdfGenerator {
  /**
   * Creates a PDF from an array of image files.
   * 
   * @param {string[]} imagePaths - Array of absolute paths to the images.
   * @param {string} outputDir - Directory to save the PDF.
   * @param {string} [filename='apresentacao.pdf'] - Name of the output PDF.
   * @returns {Promise<string>} The absolute path to the generated PDF.
   */
  async generateFromImages(imagePaths, outputDir, filename = 'apresentacao.pdf') {
    if (!imagePaths || imagePaths.length === 0) {
      throw new Error('Nenhuma imagem fornecida para gerar o PDF.');
    }

    // Filter valid images (PNG and JPEG supported by pdf-lib natively)
    const validImages = imagePaths.filter(p => {
      const ext = path.extname(p).toLowerCase();
      return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    });

    if (validImages.length === 0) {
      throw new Error('As imagens geradas não estão num formato suportado para PDF (apenas PNG/JPEG).');
    }

    console.log(`\n📄 Iniciando criação do PDF com ${validImages.length} slide(s)...`);
    
    // Sort logically to ensure slide-1, slide-2 etc. are ordered
    validImages.sort((a, b) => {
      const numA = a.match(/\d+/g) ? parseInt(a.match(/\d+/g).pop()) : 0;
      const numB = b.match(/\d+/g) ? parseInt(b.match(/\d+/g).pop()) : 0;
      return numA - numB;
    });

    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < validImages.length; i++) {
      const imgPath = validImages[i];
      const ext = path.extname(imgPath).toLowerCase();
      
      try {
        const imageBytes = fs.readFileSync(imgPath);
        let image;

        if (ext === '.png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        
        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      } catch (err) {
        console.warn(`⚠️ Não foi possível embutir a imagem ${path.basename(imgPath)} no PDF:`, err.message);
      }
    }

    if (pdfDoc.getPageCount() === 0) {
      throw new Error('Falha ao processar imagens. O PDF resultante estaria vazio.');
    }

    const pdfBytes = await pdfDoc.save();
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log(`✅ PDF gerado com sucesso em: ${outputPath}`);
    return outputPath;
  }
}

module.exports = PdfGenerator;
