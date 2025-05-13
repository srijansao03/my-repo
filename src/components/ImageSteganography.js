import React, { useState, useRef } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import CryptoJS from 'crypto-js';
import FileSaver from 'file-saver';

const ImageSteganography = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [outputImage, setOutputImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState('encode'); // encode or decode
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ success: false, message: '', error: false });
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  const processImageFile = (file) => {
    if (!file || !file.type.match('image.*')) {
      setResult({
        success: false,
        message: 'Please select a valid image file.',
        error: true
      });
      return;
    }

    setImage(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Reset any previous results
    setOutputImage('');
    setResult({ success: false, message: '', error: false });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const encodeMessage = async () => {
    if (!image) {
      setResult({
        success: false,
        message: 'Please select an image first.',
        error: true
      });
      return;
    }

    if (!message.trim()) {
      setResult({
        success: false,
        message: 'Please enter a message to hide.',
        error: true
      });
      return;
    }

    setLoading(true);
    
    try {
      // Use a simple LSB (Least Significant Bit) steganography technique
      // This is a simplified implementation for demonstration
      // In production, use more sophisticated techniques
      
      // Load the image
      const reader = new FileReader();
      
      reader.onload = () => {
        const img = new Image();
        
        img.onload = () => {
          // Create a canvas to manipulate the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // Get the image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Encrypt the message if password is provided
          let messageToHide = message;
          if (password) {
            messageToHide = CryptoJS.AES.encrypt(message, password).toString();
          }
          
          // Convert message to binary
          const binaryMessage = toBinary(messageToHide + "EOT"); // EOT = End of transmission
          
          // Check if the message can fit in the image
          if (binaryMessage.length > data.length / 4) {
            setResult({
              success: false,
              message: 'Message too large for this image.',
              error: true
            });
            setLoading(false);
            return;
          }
          
          // Embed the message in the least significant bits of the image data
          let binaryIndex = 0;
          
          for (let i = 0; i < data.length && binaryIndex < binaryMessage.length; i += 4) {
            // Only modify the blue channel to minimize visual impact
            if (binaryIndex < binaryMessage.length) {
              // Set the LSB of the blue channel based on the message bit
              data[i + 2] = (data[i + 2] & 0xFE) | parseInt(binaryMessage[binaryIndex]);
              binaryIndex++;
            }
          }
          
          // Update the canvas with the modified image data
          ctx.putImageData(imageData, 0, 0);
          
          // Convert the canvas to a data URL for display
          const outputImageUrl = canvas.toDataURL('image/png');
          setOutputImage(outputImageUrl);
          
          setResult({
            success: true,
            message: 'Message hidden successfully!',
            error: false
          });
          
          setLoading(false);
        };
        
        img.src = reader.result;
      };
      
      reader.readAsDataURL(image);
      
    } catch (error) {
      console.error('Error in encoding:', error);
      setResult({
        success: false,
        message: 'Error hiding the message. Please try again.',
        error: true
      });
      setLoading(false);
    }
  };

  const decodeMessage = async () => {
    if (!image) {
      setResult({
        success: false,
        message: 'Please select an image to decode.',
        error: true
      });
      return;
    }

    setLoading(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = () => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Extract the binary message from the LSBs
          let binaryMessage = '';
          let extractedMessage = '';
          
          for (let i = 0; i < data.length; i += 4) {
            // Extract the LSB of the blue channel
            binaryMessage += (data[i + 2] & 1).toString();
            
            // Every 8 bits, convert to ASCII
            if (binaryMessage.length >= 8) {
              const char = String.fromCharCode(parseInt(binaryMessage.slice(0, 8), 2));
              extractedMessage += char;
              binaryMessage = binaryMessage.slice(8);
              
              // Check for end of transmission marker
              if (extractedMessage.endsWith('EOT')) {
                extractedMessage = extractedMessage.slice(0, -3); // Remove EOT marker
                break;
              }
            }
          }
          
          if (!extractedMessage) {
            setResult({
              success: false,
              message: 'No hidden message found or the image format is not compatible.',
              error: true
            });
            setLoading(false);
            return;
          }
          
          // Decrypt if password is provided
          try {
            if (password) {
              const decrypted = CryptoJS.AES.decrypt(extractedMessage, password).toString(CryptoJS.enc.Utf8);
              
              if (decrypted) {
                extractedMessage = decrypted;
              } else {
                setResult({
                  success: false,
                  message: 'Incorrect password or no encryption used.',
                  error: true
                });
                setLoading(false);
                return;
              }
            }
            
            setMessage(extractedMessage);
            setResult({
              success: true,
              message: 'Message extracted successfully!',
              error: false
            });
          } catch (decryptError) {
            setResult({
              success: false,
              message: 'Failed to decrypt. Incorrect password or the message was not encrypted.',
              error: true
            });
          }
          
          setLoading(false);
        };
        
        img.src = reader.result;
      };
      
      reader.readAsDataURL(image);
      
    } catch (error) {
      console.error('Error in decoding:', error);
      setResult({
        success: false,
        message: 'Error extracting the message. Please try again.',
        error: true
      });
      setLoading(false);
    }
  };

  const saveImage = () => {
    if (outputImage) {
      // Convert base64 to blob
      fetch(outputImage)
        .then(res => res.blob())
        .then(blob => {
          FileSaver.saveAs(blob, 'steg-image.png');
        });
    }
  };

  // Helper function to convert text to binary
  const toBinary = (text) => {
    let binary = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i).toString(2).padStart(8, '0');
      binary += charCode;
    }
    return binary;
  };

  return (
    <Card className="steg-card">
      <Card.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Mode</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="encode-radio"
                    label="Hide Message"
                    name="stegMode"
                    checked={mode === 'encode'}
                    onChange={() => {
                      setMode('encode');
                      setResult({ success: false, message: '', error: false });
                    }}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="decode-radio"
                    label="Extract Message"
                    name="stegMode"
                    checked={mode === 'decode'}
                    onChange={() => {
                      setMode('decode');
                      setResult({ success: false, message: '', error: false });
                    }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={mode === 'encode' ? 6 : 12}>
              <div
                className={`drag-drop-area ${isDragging ? 'drag-drop-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div>
                  <i className="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                  <p>Drag & drop an image or click to browse</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </div>
              </div>

              {previewUrl && (
                <div className="text-center">
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
              )}
            </Col>

            {mode === 'encode' && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Message to Hide</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your secret message here..."
                    className="text-area"
                  />
                  <Form.Text className="text-muted">
                    The message will be hidden in the image.
                  </Form.Text>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password (Optional)</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="For additional security"
                />
                <Form.Text className="text-muted">
                  A password will encrypt the hidden message.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <div className="d-grid gap-2 d-md-flex">
                {mode === 'encode' ? (
                  <Button
                    variant="primary"
                    onClick={encodeMessage}
                    disabled={loading || !image || !message.trim()}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                        Processing...
                      </>
                    ) : (
                      'Hide Message'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={decodeMessage}
                    disabled={loading || !image}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                        Extracting...
                      </>
                    ) : (
                      'Extract Message'
                    )}
                  </Button>
                )}
              </div>
            </Col>
          </Row>

          {result.message && (
            <Alert variant={result.error ? 'danger' : 'success'} className="mt-3">
              {result.message}
            </Alert>
          )}

          {mode === 'decode' && result.success && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Extracted Message:</Card.Title>
                <Card.Text>{message}</Card.Text>
              </Card.Body>
            </Card>
          )}

          {mode === 'encode' && outputImage && (
            <div className="output-container">
              <h5>Result:</h5>
              <div className="text-center">
                <img src={outputImage} alt="Output" className="preview-image" />
                <div className="mt-2">
                  <Button variant="success" onClick={saveImage}>
                    Save Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ImageSteganography; 