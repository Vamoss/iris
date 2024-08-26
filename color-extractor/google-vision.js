const fs = require('fs');
const path = require('path');
const vision = require('@google-cloud/vision');

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./color-extractor/client_secret_703939205694-v0t1bpr60e8ihf0r309tru6uhbdbnfk6.apps.googleusercontent.com.json";

async function analyzeImage(imagePath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.imageProperties(imagePath);
    return result.imagePropertiesAnnotation.dominantColors.colors;
}

async function processImages() {
    const imagesDir = path.join(__dirname, 'images');
    const dataDir = path.join(__dirname, 'google-vision');

    // Criar o diretório de saída, se não existir
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // Ler todos os arquivos na pasta /images
    const files = fs.readdirSync(imagesDir);

    for (const file of files) {
        const imagePath = path.join(imagesDir, file);

        try {
            const colors = await analyzeImage(imagePath);
            const jsonFileName = path.join(dataDir, `${path.parse(file).name}.json`);

            // Salvar as cores em um arquivo JSON
            fs.writeFileSync(jsonFileName, JSON.stringify(colors, null, 2));
            console.log(`Cores extraídas e salvas em: ${jsonFileName}`);
        } catch (error) {
            console.error(`Erro ao processar ${file}:`, error);
        }
    }
}

processImages().catch(console.error);