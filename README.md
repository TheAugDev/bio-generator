# Denton City Bio Generator
by THE AUGMENTED DEVELOPER

City Department Bio Generator
This web application was developed by The Augmented Developer. It allows users to easily create visually appealing bio cards, perfect for welcoming new members to various city departments. Users can upload a photo, an optional department logo, and enter biographical information. The application then generates a composite image that can be downloaded.

Disclaimer
This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

This project is for demonstration and utility purposes. Users are responsible for ensuring they have the rights to use any images (photos, logos, AI-generated backgrounds) uploaded to the application.

Features
Photo Upload: Upload a photo of the new member.

Logo Upload: Optionally include a department logo.

AI Background (Optional): Upload a pre-generated AI background image to add a unique texture. If not provided, a default gradient background is used.

Customizable Text: Input fields for:

Member's Full Name

Member's Title

Bio Content (supports multiple paragraphs)

Display Date

Footer Text (e.g., Department Name)

Live Preview: The bio card is generated and previewed directly on the page.

Downloadable Image: Download the generated bio card as a PNG image.

How to Use
This is a client-side application built with HTML, CSS, and JavaScript.

GitHub Pages:

If deployed on GitHub Pages, simply navigate to the provided GitHub Pages URL for this repository.

Local Usage:

Clone or download this repository.

Open the index.html file in your web browser.

Using the Generator:

Fill in the input fields for the member's details.

Upload the member's photo.

Optionally, upload a department logo.

Optionally, upload an AI-generated background image.

Click the "Generate Bio" button. The preview will update.

Click the "Download Bio Image" button to save the generated card.

File Structure
index.html: The main HTML file containing the structure of the web page.

style.css: Contains all the custom CSS styles for the application, supplementing Tailwind CSS.

script.js: Contains all the JavaScript logic for image handling, canvas drawing, and user interactions.

Technologies Used
HTML5

CSS3 (with Tailwind CSS via CDN)

JavaScript (Vanilla)

HTML Canvas API for image generation

Customization Notes
Styling: Most visual aspects are controlled via style.css and Tailwind CSS classes in index.html. The canvas drawing logic in script.js (specifically the drawBioDentonSample function) handles the layout and styling of the generated bio image.

Placeholder Images: The script.js file contains SVG data URLs for placeholder images for the member's photo and the department logo. These are used if no image is uploaded or if an uploaded image fails to load.

Default Values: Default values for some fields (like "Police Officer" for title or the footer text) are set in the value attribute of the respective input fields in index.html or within the initializeApp function in script.js for sample data.

Future Enhancements (Ideas)
More predefined background templates.

Direct integration with an AI image generation API for on-the-fly background creation (currently supports uploading pre-generated AI images).

More advanced text formatting options (e.g., font selection, bold/italic within bio).

Color pickers for more elements (e.g., background gradient colors).
