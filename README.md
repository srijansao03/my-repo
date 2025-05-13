# Steganography Web Application

A user-friendly web application for hiding secret messages in images and text using steganography techniques.

## Features

### Image Steganography
- Hide text messages inside image files
- Extract hidden messages from images
- Password protection for additional security
- Download the modified images with hidden data
- Support for drag and drop file uploads

### Text Steganography
- Hide messages within regular text using invisible Unicode characters
- Extract hidden messages from text
- Password encryption for sensitive data
- Copy results to clipboard

## Technologies Used

- React.js for the frontend interface
- Bootstrap for responsive UI components
- CryptoJS for message encryption
- FileSaver.js for downloading modified files
- Custom steganography algorithms:
  - LSB (Least Significant Bit) technique for images
  - Zero-width character encoding for text

## How It Works

### Image Steganography
This application uses the LSB (Least Significant Bit) steganography technique to hide messages in images. The method works by replacing the least significant bit of each color channel with bits from the secret message, resulting in visually imperceptible changes to the image.

### Text Steganography
For text-based steganography, the application uses zero-width characters (specifically Zero-Width Space and Zero-Width Non-Joiner) to encode binary data within regular text. These characters are invisible to the human eye but can be processed by computers.

## Security Notes

- For sensitive information, always use the password encryption feature
- Remember that steganography is about hiding the existence of a message, not making it unbreakable
- This application is for educational purposes and should not be relied upon for high-security applications

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the application with `npm start`
4. Open http://localhost:3000 in your browser

## Usage

### Hiding a Message in an Image
1. Select the "Image Steganography" tab
2. Choose "Hide Message" mode
3. Upload an image using drag & drop or file browser
4. Enter your secret message
5. (Optional) Add a password for encryption
6. Click "Hide Message"
7. Download the resulting image with your hidden message

### Extracting a Message from an Image
1. Select the "Image Steganography" tab
2. Choose "Extract Message" mode
3. Upload the image containing the hidden message
4. (Optional) Enter the password if the message was encrypted
5. Click "Extract Message"
6. View the extracted message

Similar steps apply for text steganography, with the option to copy the resulting text to your clipboard.

## License

MIT
