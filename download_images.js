const fs = require('fs');
const https = require('https');
const path = require('path');

const imgDir = path.join(__dirname, 'data', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

const styles = ['bottts', 'adventurer'];

async function download() {
  for (let s = 0; s < styles.length; s++) {
    const style = styles[s];
    for (let i = 1; i <= 10; i++) {
      const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${i}`;
      const dest = path.join(imgDir, `${style}_${i}.svg`);
      
      await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download ${url}`));
            return;
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', reject);
      });
      console.log(`Downloaded ${style}_${i}.svg`);
    }
  }
}

download().catch(console.error);
