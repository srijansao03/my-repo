import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import CryptoJS from 'crypto-js';

const TextSteganography = () => {
  const [originalText, setOriginalText] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [resultText, setResultText] = useState('');
  const [mode, setMode] = useState('encode'); // encode or decode
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ success: false, message: '', error: false });

  // Function to hide a message within text using invisible characters
  const encodeMessage = () => {
    if (!originalText.trim()) {
      setResult({
        success: false,
        message: 'Please enter the carrier text.',
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
      // Encrypt the message if password is provided
      let messageToHide = message;
      if (password) {
        messageToHide = CryptoJS.AES.encrypt(message, password).toString();
      }

      // Convert the message to binary
      const binaryMessage = toBinary(messageToHide);

      // Use zero-width characters for steganography
      // Zero-width space: ​ (U+200B)
      // Zero-width non-joiner: ‌ (U+200C)
      const zeroWidthSpace = '\u200B';     // Binary '0'
      const zeroWidthNonJoiner = '\u200C';  // Binary '1'

      let stegoText = originalText;
      
      // Add EOT (End of Text) marker to detect end during decoding
      const binaryWithEOT = binaryMessage + toBinary('EOT');

      // Insert the binary message as zero-width characters
      let encodedMessage = '';
      for (let i = 0; i < binaryWithEOT.length; i++) {
        encodedMessage += binaryWithEOT[i] === '0' ? zeroWidthSpace : zeroWidthNonJoiner;
      }

      // Append the encoded message to the end of the text
      // Or alternatively, insert between words or after specific punctuation marks
      stegoText += encodedMessage;

      setResultText(stegoText);
      setResult({
        success: true,
        message: 'Message hidden successfully!',
        error: false
      });

    } catch (error) {
      console.error('Error in encoding:', error);
      setResult({
        success: false,
        message: 'Error hiding the message. Please try again.',
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to extract a hidden message from the text
  const decodeMessage = () => {
    if (!originalText.trim()) {
      setResult({
        success: false,
        message: 'Please enter text to decode.',
        error: true
      });
      return;
    }

    setLoading(true);

    try {
      // Define the zero-width characters
      const zeroWidthSpace = '\u200B';     // Binary '0'
      const zeroWidthNonJoiner = '\u200C';  // Binary '1'

      // Extract the zero-width characters to get the binary message
      let binaryMessage = '';
      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === zeroWidthSpace) {
          binaryMessage += '0';
        } else if (originalText[i] === zeroWidthNonJoiner) {
          binaryMessage += '1';
        }
      }

      if (binaryMessage.length === 0) {
        setResult({
          success: false,
          message: 'No hidden message found.',
          error: true
        });
        setLoading(false);
        return;
      }

      // Convert binary to text
      let extractedMessage = '';
      for (let i = 0; i < binaryMessage.length; i += 8) {
        const byte = binaryMessage.substr(i, 8);
        if (byte.length === 8) {
          extractedMessage += String.fromCharCode(parseInt(byte, 2));
        }
      }

      // Check for EOT marker
      const eotIndex = extractedMessage.indexOf('EOT');
      if (eotIndex !== -1) {
        extractedMessage = extractedMessage.substring(0, eotIndex);
      }

      // Decrypt if password is provided
      try {
        if (password && extractedMessage) {
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

    } catch (error) {
      console.error('Error in decoding:', error);
      setResult({
        success: false,
        message: 'Error extracting the message. Please try again.',
        error: true
      });
    } finally {
      setLoading(false);
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

  // Function to copy the result text to clipboard
  const copyToClipboard = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText)
        .then(() => {
          setResult({
            success: true,
            message: 'Copied to clipboard!',
            error: false
          });
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          setResult({
            success: false,
            message: 'Failed to copy to clipboard.',
            error: true
          });
        });
    }
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
                    id="encode-text-radio"
                    label="Hide Message"
                    name="textStegMode"
                    checked={mode === 'encode'}
                    onChange={() => {
                      setMode('encode');
                      setResult({ success: false, message: '', error: false });
                      setResultText('');
                    }}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="decode-text-radio"
                    label="Extract Message"
                    name="textStegMode"
                    checked={mode === 'decode'}
                    onChange={() => {
                      setMode('decode');
                      setResult({ success: false, message: '', error: false });
                      setMessage('');
                    }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  {mode === 'encode' ? 'Carrier Text' : 'Text to Decode'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder={mode === 'encode' 
                    ? "Enter text that will carry the hidden message..." 
                    : "Enter text that contains a hidden message..."}
                  className="text-area"
                />
                <Form.Text className="text-muted">
                  {mode === 'encode'
                    ? 'The carrier text should be long enough to hide your message.'
                    : 'Text containing hidden message using zero-width characters.'}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              {mode === 'encode' ? (
                <Form.Group className="mb-3">
                  <Form.Label>Message to Hide</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your secret message here..."
                    className="text-area"
                  />
                  <Form.Text className="text-muted">
                    This message will be hidden in the carrier text.
                  </Form.Text>
                </Form.Group>
              ) : (
                result.success && (
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Extracted Message:</Card.Title>
                      <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Card.Text>
                    </Card.Body>
                  </Card>
                )
              )}
            </Col>
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
                    disabled={loading || !originalText.trim() || !message.trim()}
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
                    disabled={loading || !originalText.trim()}
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

          {mode === 'encode' && resultText && (
            <div className="output-container">
              <h5>Result Text:</h5>
              <Card>
                <Card.Body>
                  <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{resultText}</Card.Text>
                  <div className="mt-2">
                    <Button variant="success" onClick={copyToClipboard}>
                      Copy to Clipboard
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TextSteganography; 