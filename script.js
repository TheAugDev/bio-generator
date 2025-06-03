/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- Global constants and context ---
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 675; // A 16:9 like aspect ratio
let ctx; // Will be CanvasRenderingContext2D

// --- DOM Element References ---
// These will be assigned in initializeApp
let recruitNameInput;
let recruitTitleInput;
let bioTextInput; // Corrected ID from bioText to bioTextInput for consistency
let recruitPhotoInput;
let logoImageInput;
let aiBgImageInput;
let displayDateInput;
let footerTextInput;
let generateButton;
let downloadButton;
let canvas;

let recruitPhotoPreview;
let logoImagePreview;
let aiBgImagePreview;
let loadingSpinner;


// --- Image Placeholders and State ---
const recruitPhotoPlaceholderSrc = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" fill="%23cccccc"><rect width="100" height="125" fill="%23e0e0e0"/><path d="M50 15 C35 15 25 28 25 45 C25 62 35 75 50 75 C65 75 75 62 75 45 C75 28 65 15 50 15 Z M50 25 C59.3898 25 67 32.6102 67 42 C67 51.3898 59.3898 59 50 59 C40.6102 59 33 51.3898 33 42 C33 32.6102 40.6102 25 50 25 Z M20 115 C20 90 35 80 50 80 C65 80 80 90 80 115 L20 115 Z" fill="%23bdbdbd"/><text x="50%" y="100" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10px" fill="%23757575">Officer Photo</text></svg>';
const logoPlaceholderSrc = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e0e0e0"/><path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="%23bdbdbd" stroke="%23a0a0a0" stroke-width="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14px" fill="%23555555" font-weight="bold">LOGO</text></svg>';


let currentRecruitImgEl; // Will be HTMLImageElement
let currentLogoImgEl = null; // Will be HTMLImageElement or null
let currentAiBgImgEl = null; // Will be HTMLImageElement or null


/**
 * Wraps text to fit within a maximum width.
 * @param {CanvasRenderingContext2D} context The 2D rendering context.
 * @param {string} text The text to wrap.
 * @param {number} maxWidth The maximum width of a line.
 * @param {number} lineHeight The height of a line (for advancing Y position).
 * @param {string} font The font string (e.g., "16px Arial").
 * @returns {string[]} An array of strings, where each string is a line.
 */
function wrapTextReturnLines(context, text, maxWidth, lineHeight, font) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    context.font = font; // Set font for accurate measurement

    if (maxWidth <= 0) { // Safety check for zero or negative maxWidth
        lines.push(text);
        return lines;
    }

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine === '' ? word : currentLine + ' ' + word;
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine !== '') {
        lines.push(currentLine);
    }
    return lines;
}


/**
 * The main drawing function for the bio card.
 */
function drawBioDentonSample(aiBgImg, recruitImg, logoImg, recruitName, recruitTitle, bioText, textColor, displayDate, footerText) {
    if (!ctx) { return; }
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw AI Background (if available)
    if (aiBgImg && aiBgImg.complete && aiBgImg.naturalWidth > 0) {
        const bgAspect = aiBgImg.width / aiBgImg.height;
        const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
        let bgDrawWidth, bgDrawHeight, bgX, bgY;
        if (bgAspect > canvasAspect) {
            bgDrawHeight = CANVAS_HEIGHT;
            bgDrawWidth = bgDrawHeight * bgAspect;
            bgX = (CANVAS_WIDTH - bgDrawWidth) / 2;
            bgY = 0;
        } else {
            bgDrawWidth = CANVAS_WIDTH;
            bgDrawHeight = bgDrawWidth / bgAspect;
            bgX = 0;
            bgY = (CANVAS_HEIGHT - bgDrawHeight) / 2;
        }
        ctx.drawImage(aiBgImg, bgX, bgY, bgDrawWidth, bgDrawHeight);
    }

    // 2. Draw Denton PD Style Gradient Overlay
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#002D5D'); // Darker Primary Blue
    gradient.addColorStop(0.5, '#003c71'); // Mid Blue
    gradient.addColorStop(1, '#00447C'); // Lighter Primary Blue

    ctx.fillStyle = gradient;
    ctx.globalAlpha = (aiBgImg && aiBgImg.complete && aiBgImg.naturalWidth > 0) ? 0.92 : 1.0; // Slightly less alpha for BG
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1.0;

    // --- Layout constants ---
    const padding = 40;
    const photoAreaWidth = CANVAS_WIDTH * 0.36;
    const dividerX = photoAreaWidth + padding * 0.4;
    const contentAreaX = dividerX + padding * 0.5;
    const contentAreaFullWidth = CANVAS_WIDTH - contentAreaX - padding;
    const internalBlockGap = 8; // Small gap between elements like Name-Title

    const targetBioPixelWidth = contentAreaFullWidth - (padding / 2);

    // --- Helper function for text with shadow ---
    function drawTextWithShadow(text, x, y, font, color, shadowColor = 'rgba(0,0,0,0.4)', shadowBlur = 3, shadowOffsetX = 2, shadowOffsetY = 2) {
        ctx.font = font;
        ctx.fillStyle = shadowColor;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.fillText(text, x, y);

        ctx.shadowColor = 'transparent'; // Reset shadow for main text
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    // 3. "Welcome to the Team" Title
    const welcomeTitleText = "Welcome to the Team";
    const welcomeTitleFont = "900 58px 'Inter', sans-serif";
    ctx.font = welcomeTitleFont;
    const welcomeTitleMetrics = ctx.measureText(welcomeTitleText);
    const titleBaselineY = padding * 1.8;
    ctx.textAlign = "center";
    drawTextWithShadow(welcomeTitleText, CANVAS_WIDTH / 2, titleBaselineY, welcomeTitleFont, textColor, 'rgba(0,0,0,0.3)', 4, 3, 3);

    // 4. Draw Recruit Photo
    if (recruitImg && recruitImg.complete && recruitImg.naturalWidth > 0) {
        const photoAspectRatio = recruitImg.width / recruitImg.height;
        let photoDisplayWidth = photoAreaWidth - padding * 2.2;
        let photoDisplayHeight = photoDisplayWidth / photoAspectRatio;
        const maxPhotoHeight = CANVAS_HEIGHT - padding * 3.8 - 40;
        if (photoDisplayHeight > maxPhotoHeight) {
            photoDisplayHeight = maxPhotoHeight;
            photoDisplayWidth = photoDisplayHeight * photoAspectRatio;
        }
        const photoX = padding * 0.7;
        const photoY = (CANVAS_HEIGHT - photoDisplayHeight - 40) / 2 + 20;

        ctx.save();
        const cornerRadius = 25;
        ctx.beginPath();
        ctx.moveTo(photoX + cornerRadius, photoY);
        ctx.lineTo(photoX + photoDisplayWidth - cornerRadius, photoY);
        ctx.quadraticCurveTo(photoX + photoDisplayWidth, photoY, photoX + photoDisplayWidth, photoY + cornerRadius);
        ctx.lineTo(photoX + photoDisplayWidth, photoY + photoDisplayHeight - cornerRadius);
        ctx.quadraticCurveTo(photoX + photoDisplayWidth, photoY + photoDisplayHeight, photoX + photoDisplayWidth - cornerRadius, photoY + photoDisplayHeight);
        ctx.lineTo(photoX + cornerRadius, photoY + photoDisplayHeight);
        ctx.quadraticCurveTo(photoX, photoY + photoDisplayHeight, photoX, photoY + photoDisplayHeight - cornerRadius);
        ctx.lineTo(photoX, photoY + cornerRadius);
        ctx.quadraticCurveTo(photoX, photoY, photoX + cornerRadius, photoY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(recruitImg, photoX, photoY, photoDisplayWidth, photoDisplayHeight);
        ctx.restore();
        
        // Re-create path for stroke as clip consumes it
        ctx.beginPath();
        ctx.moveTo(photoX + cornerRadius, photoY);
        ctx.lineTo(photoX + photoDisplayWidth - cornerRadius, photoY);
        ctx.quadraticCurveTo(photoX + photoDisplayWidth, photoY, photoX + photoDisplayWidth, photoY + cornerRadius);
        ctx.lineTo(photoX + photoDisplayWidth, photoY + photoDisplayHeight - cornerRadius);
        ctx.quadraticCurveTo(photoX + photoDisplayWidth, photoY + photoDisplayHeight, photoX + photoDisplayWidth - cornerRadius, photoY + photoDisplayHeight);
        ctx.lineTo(photoX + cornerRadius, photoY + photoDisplayHeight);
        ctx.quadraticCurveTo(photoX, photoY + photoDisplayHeight, photoX, photoY + photoDisplayHeight - cornerRadius);
        ctx.lineTo(photoX, photoY + cornerRadius);
        ctx.quadraticCurveTo(photoX, photoY, photoX + cornerRadius, photoY);
        ctx.closePath();
        ctx.strokeStyle = '#002040'; // Darker border for photo
        ctx.lineWidth = 10;
        ctx.stroke(); 
    }


    // --- Text and Logo Area (Right side) ---
    const gapAfterWelcomeTitle = 80; 
    let currentY = titleBaselineY + (welcomeTitleMetrics.actualBoundingBoxDescent || 15) + gapAfterWelcomeTitle;
    const nameBlockStartY = currentY;

    ctx.textAlign = "left";

    const logoSize = (logoImg && logoImg.complete && logoImg.naturalWidth > 0) ? Math.min(165, CANVAS_HEIGHT / 5) : 0;
    const logoAreaXStart = logoImg ? CANVAS_WIDTH - logoSize - padding * 1.0 : CANVAS_WIDTH;
    const logoAreaYStart = logoImg ? nameBlockStartY - internalBlockGap * 1.5 : 0;
    const logoAreaYEnd = logoImg ? logoAreaYStart + logoSize + 65 : 0;


    // 6. Recruit Name
    const nameFont = "800 48px 'Inter', sans-serif";
    let nameBlockEndY = currentY;
    let nameMaxWidth = contentAreaFullWidth - padding / 2;
    if (logoImg && currentY < logoAreaYEnd && (contentAreaX + nameMaxWidth) > logoAreaXStart) {
         nameMaxWidth = logoAreaXStart - contentAreaX - padding * 0.8;
    }
    const nameLineHeight = 58;
    const nameLines = wrapTextReturnLines(ctx, recruitName.toUpperCase(), nameMaxWidth > 0 ? nameMaxWidth : 1, nameLineHeight, nameFont);
    nameLines.forEach(line => {
         let lineCurrentY = nameBlockEndY;
         if (logoImg && lineCurrentY < logoAreaYEnd && lineCurrentY + nameLineHeight > logoAreaYStart && (contentAreaX + ctx.measureText(line).width) > logoAreaXStart) {
            const tempNameMaxWidth = logoAreaXStart - contentAreaX - padding * 0.8;
            const reWrappedNameLines = wrapTextReturnLines(ctx, line, tempNameMaxWidth > 0 ? tempNameMaxWidth : 1, nameLineHeight, nameFont);
            reWrappedNameLines.forEach(rwLine => {
                drawTextWithShadow(rwLine, contentAreaX, lineCurrentY, nameFont, textColor, 'rgba(0,0,0,0.25)', 3, 2, 2);
                lineCurrentY += nameLineHeight;
            });
            nameBlockEndY = lineCurrentY;
         } else {
            drawTextWithShadow(line, contentAreaX, nameBlockEndY, nameFont, textColor, 'rgba(0,0,0,0.25)', 3, 2, 2);
            nameBlockEndY += nameLineHeight;
         }
    });
    currentY = nameBlockEndY;


    // 7. Recruit Title
    const trimmedRecruitTitle = recruitTitle.trim();
    if (trimmedRecruitTitle !== "") {
        currentY += internalBlockGap;
        const recruitTitleFont = "600 28px 'Inter', sans-serif";
        ctx.font = recruitTitleFont;
        ctx.fillStyle = textColor;


        let titleMaxWidth = contentAreaFullWidth - padding / 2;
        if (logoImg && currentY < logoAreaYEnd && (currentY + 28 > logoAreaYStart) && (contentAreaX + ctx.measureText(trimmedRecruitTitle.toUpperCase()).width > logoAreaXStart)) {
            titleMaxWidth = logoAreaXStart - contentAreaX - padding * 0.8;
        }
        const titleLineHeight = 30;
        const titleLines = wrapTextReturnLines(ctx, trimmedRecruitTitle.toUpperCase(), titleMaxWidth > 0 ? titleMaxWidth : 1, titleLineHeight, recruitTitleFont);
        let currentTitleLineY = currentY;
        titleLines.forEach(line => {
            ctx.fillText(line, contentAreaX, currentTitleLineY);
            currentTitleLineY += titleLineHeight;
        });
        currentY = currentTitleLineY;
    }

    // 8. Department Logo (if uploaded)
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        const logoX = logoAreaXStart;
        const logoY = logoAreaYStart;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        if (logoAreaYEnd > currentY ) {
             currentY = logoAreaYEnd + internalBlockGap;
        }
         ctx.textAlign = "left";
    }

    // 9. Bio Content
    const gapBeforeBioContent = 20; // This was the previous gap, now using internalBlockGap
    currentY += internalBlockGap; // Use the consistent internalBlockGap

    ctx.font = "500 22px 'Inter', sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    const bioLineHeight = 30;
    const bioInterParagraphSpacing = bioLineHeight * 0.5;

    const maxBioY = CANVAS_HEIGHT - padding * 1.1 - (displayDate ? 50 : 0) - (footerText ? 40 : 0);
    let lastBioLineY = currentY; // Initialize with currentY before bio lines are drawn

    const originalBioLines = bioText.split('\n');
    let hasProcessedFirstBioContentLine = false;

    originalBioLines.forEach((lineContent) => {
        const trimmedLineContent = lineContent.trim();

        if (trimmedLineContent === "") {
            if (hasProcessedFirstBioContentLine) { // Only add inter-paragraph space if not the first empty line
                currentY += bioInterParagraphSpacing;
            }
            return; // Skip empty lines for drawing
        }

        if (!hasProcessedFirstBioContentLine) {
            hasProcessedFirstBioContentLine = true;
        } else if (lineContent.trim() !== "" && originalBioLines[originalBioLines.indexOf(lineContent)-1]?.trim() === "") {
             // If this is a new paragraph (previous line was empty), currentY is already advanced by bioInterParagraphSpacing
        }


        let currentSegmentMaxWidth = Math.min(targetBioPixelWidth, contentAreaFullWidth - padding / 2);
        if (logoImg && currentY < logoAreaYEnd && (currentY + bioLineHeight > logoAreaYStart)) {
            const widthBesidesLogo = logoAreaXStart - contentAreaX - padding * 0.8;
            if (widthBesidesLogo > 0) {
                currentSegmentMaxWidth = Math.min(currentSegmentMaxWidth, widthBesidesLogo);
            }
        }
        if (currentSegmentMaxWidth <= 0) { // Fallback if calculated width is too small
            currentSegmentMaxWidth = Math.min(targetBioPixelWidth, contentAreaFullWidth - padding / 2);
        }
         if (currentSegmentMaxWidth <= 0) { // Absolute fallback
            currentSegmentMaxWidth = 1;
        }


        const wrappedLinesForThisSegment = wrapTextReturnLines(ctx, trimmedLineContent, currentSegmentMaxWidth, bioLineHeight, ctx.font);

        wrappedLinesForThisSegment.forEach(wrappedLine => {
            if (wrappedLine.trim() === "") { return; } // Should not happen if trimmedLineContent is not empty

            if (currentY < maxBioY) {
                ctx.fillText(wrappedLine, contentAreaX, currentY);
                lastBioLineY = currentY; // Update for each drawn line
                currentY += bioLineHeight;
            }
        });
    });
    
    // Adjust lastBioLineY if no bio text was actually drawn
    if (!hasProcessedFirstBioContentLine) {
        lastBioLineY = currentY - internalBlockGap; // Revert the last gap if no bio was drawn
    }


    // 5. Vertical Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; 
    ctx.lineWidth = 2; 
    ctx.beginPath();
    const finalDividerStartY = nameBlockStartY - internalBlockGap / 2 - 10; 
    // Ensure endYForBioContent is at least where the name starts if no bio text
    const endYForBioContent = hasProcessedFirstBioContentLine ? (lastBioLineY + bioLineHeight / 2) : nameBlockStartY; 
    const finalDividerEndY = Math.max(endYForBioContent, nameBlockStartY + (recruitImg && recruitImg.complete && recruitImg.naturalHeight > 0 ? (photoAreaWidth - padding * 2.2) / (recruitImg.width/recruitImg.height) * 0.3 : 0 ) ) + 10; 

    if (finalDividerEndY > finalDividerStartY) {
      ctx.moveTo(dividerX , finalDividerStartY);
      ctx.lineTo(dividerX, finalDividerEndY);
      ctx.stroke();
    }

    // 10. Display Date (Bottom Right)
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    let singleLineDate = displayDate.toUpperCase().replace(/\s*,\s*/g, ', ');
    singleLineDate = singleLineDate.replace(/\s+/g, ' ');

    const dateYBase = CANVAS_HEIGHT - padding * 1.1 - (footerText ? 40 : 0);
    const dateFont = "700 24px 'Inter', sans-serif";
    drawTextWithShadow(singleLineDate, CANVAS_WIDTH - padding, dateYBase, dateFont, textColor, 'rgba(0,0,0,0.25)', 2, 1, 1);

    // 11. Footer Text (Bottom Center)
    if (footerText) {
        ctx.textAlign = "center";
        const footerFont = "600 20px 'Inter', sans-serif";
        const footerY = CANVAS_HEIGHT - padding * 0.5;
        drawTextWithShadow(footerText, CANVAS_WIDTH / 2, footerY, footerFont, textColor, 'rgba(0,0,0,0.35)', 2,1,1);
    }
}


// --- Image loading utility ---
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { resolve(img); };
        img.onerror = (err) => {
            console.error(`Failed to load image: ${src}`, err);
            // Create a minimal fallback placeholder if primary fails
            const fallbackImg = new Image();
            // 1x1 transparent GIF as a basic fallback
            fallbackImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
            fallbackImg.onload = () => { resolve(fallbackImg); }; // Resolve with tiny transparent image
            fallbackImg.onerror = () => { reject(err); }; // If even this fails, reject
        };
        img.src = src;
    });
}

// --- UI Interaction Logic ---

async function handleImageUpload(event, imageType) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const dataUrl = e.target?.result;
                if (imageType === 'recruit') {
                    currentRecruitImgEl = await loadImage(dataUrl);
                    recruitPhotoPreview.src = dataUrl;
                    recruitPhotoPreview.style.display = 'block';
                } else if (imageType === 'logo') {
                    currentLogoImgEl = await loadImage(dataUrl);
                    logoImagePreview.src = dataUrl;
                    logoImagePreview.style.display = 'block';
                } else if (imageType === 'aiBg') {
                    currentAiBgImgEl = await loadImage(dataUrl);
                    aiBgImagePreview.src = dataUrl;
                    aiBgImagePreview.style.display = 'block';
                }
            } catch (error) {
                console.error(`Error processing uploaded ${imageType} image:`, error);
                 // Fallback to placeholder if loading fails
                if (imageType === 'recruit') {
                    currentRecruitImgEl = await loadImage(recruitPhotoPlaceholderSrc);
                    recruitPhotoPreview.src = recruitPhotoPlaceholderSrc;
                } else if (imageType === 'logo') {
                    currentLogoImgEl = await loadImage(logoPlaceholderSrc); // Ensure this is loaded
                    logoImagePreview.src = logoPlaceholderSrc;
                } else { // AI BG
                    currentAiBgImgEl = null;
                    aiBgImagePreview.src = '#';
                    aiBgImagePreview.style.display = 'none';
                }
            }
        };
        reader.readAsDataURL(file);
    } else { // File cleared from input
        if (imageType === 'recruit') {
            currentRecruitImgEl = await loadImage(recruitPhotoPlaceholderSrc);
            recruitPhotoPreview.src = recruitPhotoPlaceholderSrc;
            recruitPhotoPreview.style.display = 'block';
        } else if (imageType === 'logo') {
            currentLogoImgEl = await loadImage(logoPlaceholderSrc); // Load placeholder if cleared
            logoImagePreview.src = logoPlaceholderSrc;
            logoImagePreview.style.display = 'block';
        } else if (imageType === 'aiBg') {
            currentAiBgImgEl = null;
            aiBgImagePreview.src = '#'; // Clear src
            aiBgImagePreview.style.display = 'none';
        }
    }
}

async function redrawCanvas() {
    // Ensure placeholders are loaded if current images are not set or failed
    if (!currentRecruitImgEl || (!currentRecruitImgEl.complete && currentRecruitImgEl.src !== recruitPhotoPlaceholderSrc) || currentRecruitImgEl.naturalWidth === 0) {
        currentRecruitImgEl = await loadImage(recruitPhotoPlaceholderSrc);
        recruitPhotoPreview.src = recruitPhotoPlaceholderSrc;
    }
    if (!currentLogoImgEl || (!currentLogoImgEl.complete && currentLogoImgEl.src !== logoPlaceholderSrc) || currentLogoImgEl.naturalWidth === 0) {
        // Only load placeholder if no user image was ever successfully loaded for logo
        if (logoImageInput.files.length === 0 && (!currentLogoImgEl || currentLogoImgEl.src === '#' || currentLogoImgEl.src === '')) {
            currentLogoImgEl = await loadImage(logoPlaceholderSrc);
            logoImagePreview.src = logoPlaceholderSrc;
        } else if (currentLogoImgEl && currentLogoImgEl.naturalWidth === 0 && currentLogoImgEl.src !== logoPlaceholderSrc){
             currentLogoImgEl = await loadImage(logoPlaceholderSrc); // Fallback if user image failed hard
             logoImagePreview.src = logoPlaceholderSrc;
        }
    }
    // AI BG is optional, so no mandatory placeholder drawing if it fails, just use null

    // A small delay to allow images to potentially finish loading if they were just set.
    // This is a simple approach; a more robust one would use image.onload events more directly
    // within the redraw flow if issues persist.
    await new Promise(resolve => setTimeout(resolve, 50));


    drawBioDentonSample(
        currentAiBgImgEl,
        currentRecruitImgEl,
        currentLogoImgEl,
        recruitNameInput.value,
        recruitTitleInput.value,
        bioTextInput.value,
        "#FFFFFF", // Assuming textColor is fixed for now, or get from input
        displayDateInput.value,
        footerTextInput.value
    );
}

function handleDownload() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `bio-card-${recruitNameInput.value.replace(/\s+/g, '_') || 'denton_pd'}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function initializeApp() {
    canvas = document.getElementById('bioCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const tempCtx = canvas.getContext('2d');
    if (!tempCtx) {
        console.error('Failed to get 2D rendering context!');
        return;
    }
    ctx = tempCtx;

    // Get DOM elements
    recruitNameInput = document.getElementById('recruitName');
    recruitTitleInput = document.getElementById('recruitTitle');
    bioTextInput = document.getElementById('bioText'); // Corrected ID
    recruitPhotoInput = document.getElementById('recruitPhoto');
    logoImageInput = document.getElementById('logoImage');
    aiBgImageInput = document.getElementById('aiBgImage');
    displayDateInput = document.getElementById('displayDate');
    footerTextInput = document.getElementById('footerText');
    generateButton = document.getElementById('generateButton');
    downloadButton = document.getElementById('downloadButton');

    recruitPhotoPreview = document.getElementById('recruitPhotoPreview');
    logoImagePreview = document.getElementById('logoImagePreview');
    aiBgImagePreview = document.getElementById('aiBgImagePreview');
    loadingSpinner = document.getElementById('loadingSpinner');


    try {
        currentRecruitImgEl = await loadImage(recruitPhotoPlaceholderSrc);
        recruitPhotoPreview.src = recruitPhotoPlaceholderSrc;
        recruitPhotoPreview.style.display = 'block';

        currentLogoImgEl = await loadImage(logoPlaceholderSrc); // Load placeholder by default
        logoImagePreview.src = logoPlaceholderSrc;
        logoImagePreview.style.display = 'block'; // Show logo placeholder

        aiBgImagePreview.style.display = 'none'; 
    } catch (error) {
        console.error("Error loading initial placeholder images:", error);
        // Basic fallbacks if loadImage itself fails catastrophically (shouldn't with internal fallback)
        currentRecruitImgEl = new Image(); 
        currentLogoImgEl = new Image();
        recruitPhotoPreview.alt = "Error loading placeholder";
        logoImagePreview.alt = "Error loading placeholder";
    }

    // Sample Data (Consider removing or commenting out for production)
    const sampleData = {
        recruitName: "OFFICER JANE ROOKIE",
        recruitTitle: "PATROL OFFICER",
        bioText: "Officer Rookie recently graduated from the Denton Police Academy and is eager to serve the citizens of Denton.\n\nIn her free time, she enjoys community engagement and local sports.",
        displayDate: "OCTOBER 28, 2024",
        footerText: "DENTON POLICE DEPARTMENT"
    };
    recruitNameInput.value = sampleData.recruitName;
    recruitTitleInput.value = sampleData.recruitTitle;
    bioTextInput.value = sampleData.bioText;
    displayDateInput.value = sampleData.displayDate;
    footerTextInput.value = sampleData.footerText;

    await redrawCanvas(); // Initial draw with placeholders/sample data

    generateButton.addEventListener('click', async () => {
        generateButton.disabled = true;
        if(loadingSpinner) loadingSpinner.style.display = 'inline-block';
        try {
            await redrawCanvas();
        } catch (error) {
            console.error("Error during canvas redraw:", error);
        } finally {
            generateButton.disabled = false;
            if(loadingSpinner) loadingSpinner.style.display = 'none';
        }
    });
    downloadButton.addEventListener('click', handleDownload);

    recruitPhotoInput.addEventListener('change', (e) => { handleImageUpload(e, 'recruit').then(() => { if (!generateButton.disabled) { generateButton.click(); } }); });
    logoImageInput.addEventListener('change', (e) => { handleImageUpload(e, 'logo').then(() => { if (!generateButton.disabled) { generateButton.click(); } }); });
    aiBgImageInput.addEventListener('change', (e) => { handleImageUpload(e, 'aiBg').then(() => { if (!generateButton.disabled) { generateButton.click(); } }); });

    [recruitNameInput, recruitTitleInput, bioTextInput, displayDateInput, footerTextInput].forEach(input => {
        if (input) { // Check if input exists before adding listener
            input.addEventListener('input', () => {
                if (!generateButton.disabled) { 
                    generateButton.click();
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
</script>
</body>
</html>
