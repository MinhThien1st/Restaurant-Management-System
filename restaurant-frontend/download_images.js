const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGES_DIR = path.join(__dirname, 'images');

// Danh sách 100 file ảnh tương ứng 100 món ăn
const imageFiles = [
    // Khai vị (20)
    "goi-cuon-tom-thit.jpg", "cha-gio-tom-thit.jpg", "sup-cua-toc-tien.jpg", "banh-xeo-mien-tay.jpg", 
    "banh-khot-vung-tau.jpg", "canh-ga-chien-nuoc-mam.jpg", "goi-ngo-sen-tom-thit.jpg", "goi-du-du-tai-heo.jpg", 
    "nem-nuong-nha-trang.jpg", "banh-bot-loc-hue.jpg", "banh-beo-chen.jpg", "banh-it-tran.jpg", 
    "hen-xuc-banh-da.jpg", "sun-ga-rang-muoi.jpg", "khoai-tay-chien-bo-toi.jpg", "dau-hu-luot-van.jpg", 
    "oc-huong-chay-toi.jpg", "ngheu-hap-sa.jpg", "banh-bao-xa-xiu.jpg", "sup-bap-cua.jpg",

    // Món chính (30)
    "com-tam-suon-bi-cha.jpg", "pho-bo-tai-nam.jpg", "pho-ga-xe.jpg", "bun-bo-hue.jpg", 
    "bun-cha-ha-noi.jpg", "bun-thit-nuong.jpg", "hu-tieu-nam-vang.jpg", "com-chien-duong-chau.jpg", 
    "com-chien-hai-san.jpg", "com-ga-hai-nam.jpg", "mi-quang-ech.jpg", "banh-canh-cua.jpg", 
    "bun-rieu-cua-dong.jpg", "bun-dau-mam-tom.jpg", "bun-moc-suon-non.jpg", "com-tho-xa-xiu.jpg", 
    "bo-kho-banh-mi.jpg", "ca-ri-ga-banh-mi.jpg", "vit-quay-bac-kinh.jpg", "heo-quay-banh-hoi.jpg", 
    "ca-kho-to.jpg", "thit-kho-hot-vit.jpg", "ga-kho-gung.jpg", "muc-xao-sa-te.jpg", 
    "tom-rim-toi-ot.jpg", "suon-xao-chua-ngot.jpg", "bo-luc-lac-khoai-tay.jpg", "ca-chem-hap-hong-kong.jpg", 
    "dau-hu-tu-xuyen.jpg", "rau-muong-xao-toi.jpg",

    // Lẩu & Súp (15)
    "lau-thai-hai-san.jpg", "lau-ga-la-giang.jpg", "lau-rieu-cua-bap-bo.jpg", "lau-bo-nhung-giam.jpg", 
    "lau-nam-thien-nhien.jpg", "canh-chua-ca-loc.jpg", "canh-kho-qua-don-thit.jpg", "canh-suon-bi-dao.jpg", 
    "canh-rong-bien-thit-bam.jpg", "canh-cai-xanh-thit-bam.jpg", "lau-tha-phan-thiet.jpg", "lau-de-ham-thuoc-bac.jpg", 
    "lau-ca-thac-lac-kho-qua.jpg", "sup-duoi-bo.jpg", "sup-vi-ca-map.jpg",

    // Tráng miệng (15)
    "che-thai-sau-rieng.jpg", "che-duong-nhan.jpg", "che-troi-nuoc.jpg", "che-khuc-bach.jpg", 
    "banh-flan-caramel.jpg", "pudding-dau-tay.jpg", "sua-chua-nep-cam.jpg", "trai-cay-dia-thap-cam.jpg", 
    "banh-kem-bap.jpg", "rau-cau-dua-xiem.jpg", "tau-hu-tran-chau-duong-den.jpg", "banh-crepe-sau-rieng.jpg", 
    "che-do-do.jpg", "che-me-den.jpg", "banh-su-kem.jpg",

    // Đồ uống (20)
    "ca-phe-sua-da.jpg", "ca-phe-den-da.jpg", "ca-phe-muoi.jpg", "tra-dao-cam-sa.jpg", 
    "tra-sua-tran-chau-truyen-thong.jpg", "nuoc-ep-cam-nguyen-chat.jpg", "nuoc-ep-dua-hau.jpg", "sinh-to-bo-sap.jpg", 
    "sinh-to-xoai-cat.jpg", "tra-xanh-lai-kem-cheese.jpg", "tra-vai-hat-sen.jpg", "soda-chanh-duong.jpg", 
    "nuoc-dua-tuoi.jpg", "nuoc-ep-dua.jpg", "sinh-to-dau-tay.jpg", "nuoc-suoi-tinh-khiet.jpg", 
    "bia-heineken.jpg", "bia-tiger.jpg", "coca-cola.jpg", "pepsi.jpg"
];

// Tạo thư mục images nếu chưa có
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Tải ảnh từ URL với xử lý redirect
function downloadFromUrl(url, filepath, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) { reject(new Error('Too many redirects')); return; }
        
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                let redirectUrl = response.headers.location;
                if (redirectUrl.startsWith('//')) redirectUrl = 'https:' + redirectUrl;
                downloadFromUrl(redirectUrl, filepath, maxRedirects - 1).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); resolve(true); });
            fileStream.on('error', (err) => { fs.unlink(filepath, () => {}); reject(err); });
        }).on('error', reject);
    });
}

// Tạo ảnh SVG placeholder (không cần thư viện bên ngoài)
function createSvgPlaceholder(filename, index, filepath) {
    const colors = [
        ['#FF6B35', '#F7C59F'], // Cam - Khai vị
        ['#D32F2F', '#FF8A80'], // Đỏ - Món chính
        ['#1565C0', '#90CAF9'], // Xanh dương - Lẩu
        ['#E91E63', '#F8BBD0'], // Hồng - Tráng miệng
        ['#2E7D32', '#A5D6A7'], // Xanh lá - Đồ uống
    ];
    
    let catIdx;
    if (index < 20) catIdx = 0;
    else if (index < 50) catIdx = 1;
    else if (index < 65) catIdx = 2;
    else if (index < 80) catIdx = 3;
    else catIdx = 4;
    
    const catNames = ['Khai Vị', 'Món Chính', 'Lẩu & Súp', 'Tráng Miệng', 'Đồ Uống'];
    const emojis = ['🥗', '🍜', '🍲', '🍰', '🥤'];
    
    const displayName = filename.replace('.jpg', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const [c1, c2] = colors[catIdx];
    
    // Tạo file SVG thay vì JPG
    const svgPath = filepath.replace('.jpg', '.svg');
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="480" fill="url(#bg)"/>
  <circle cx="320" cy="200" r="80" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
  <text x="320" y="215" font-size="60" text-anchor="middle" dominant-baseline="middle">${emojis[catIdx]}</text>
  <text x="320" y="330" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${displayName}</text>
  <text x="320" y="365" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">${catNames[catIdx]}</text>
</svg>`;

    fs.writeFileSync(svgPath, svg);
    return svgPath;
}

// Tải từng ảnh
async function downloadImage(filename, index) {
    const filepath = path.join(IMAGES_DIR, filename);
    
    // Nếu file JPG đã tồn tại và > 1KB thì bỏ qua
    if (fs.existsSync(filepath)) {
        const stat = fs.statSync(filepath);
        if (stat.size > 1000) return 'skipped';
    }
    
    // Kiểm tra file SVG đã có chưa
    const svgPath = filepath.replace('.jpg', '.svg');
    if (fs.existsSync(svgPath)) return 'skipped';

    // Thử tải từ picsum.photos (ảnh random, miễn phí, rất ổn định)
    const url = `https://picsum.photos/640/480?random=${index}&t=${Date.now()}`;
    try {
        await downloadFromUrl(url, filepath);
        return 'online';
    } catch (e) {
        // Fallback: tạo SVG placeholder
    }

    // Fallback: tạo SVG placeholder đẹp (không cần thư viện)
    try {
        createSvgPlaceholder(filename, index, filepath);
        return 'placeholder';
    } catch (e2) {
        return 'failed';
    }
}

// Main
async function startDownload() {
    console.log(`>>> Bat dau tai 100 anh vao thu muc: ${IMAGES_DIR}`);
    console.log('    Nguon: picsum.photos -> fallback: tao SVG placeholder\n');
    
    let onlineCount = 0, placeholderCount = 0, skippedCount = 0, failedCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        process.stdout.write(`[${i + 1}/100] ${filename}... `);
        
        const result = await downloadImage(filename, i);
        
        switch (result) {
            case 'online':      console.log('XONG (tai online)');    onlineCount++; break;
            case 'placeholder': console.log('XONG (tao placeholder SVG)'); placeholderCount++; break;
            case 'skipped':     console.log('BO QUA (da co san)');   skippedCount++; break;
            case 'failed':      console.log('LOI');                  failedCount++; break;
        }
        
        // Delay giữa các request để tránh bị rate-limit
        if (result === 'online') {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n>>> HOAN THANH!`);
    console.log(`    Online: ${onlineCount}`);
    console.log(`    Placeholder: ${placeholderCount}`);
    console.log(`    Da co san: ${skippedCount}`);
    console.log(`    That bai: ${failedCount}`);
}

startDownload();
