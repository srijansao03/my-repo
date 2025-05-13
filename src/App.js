import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ImageSteganography from './components/ImageSteganography';
import TextSteganography from './components/TextSteganography';

function App() {
  return (
    <div className="App">
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={10}>
            <div className="text-center mb-4">
              <h1>Steganography Tool</h1>
              <p className="lead">Hide secret messages in images or text</p>
            </div>
            
            <Tabs defaultActiveKey="image" id="steganography-tabs" className="mb-4">
              <Tab eventKey="image" title="Image Steganography">
                <ImageSteganography />
              </Tab>
              <Tab eventKey="text" title="Text Steganography">
                <TextSteganography />
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
