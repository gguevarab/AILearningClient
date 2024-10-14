import React, { useState } from 'react';
import pdfToText from 'react-pdftotext';
import ReactMarkdown from 'react-markdown';
import OpenAI from 'openai';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [response, setResponse] = useState('');
  const [prompt, setPrompt] = useState('summary'); // Default prompt corrected
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState([]); // Added flashcards state

  const openai = new OpenAI({
    apiKey: API_KEY_HERE, // Use environment variable for API key
    dangerouslyAllowBrowser: true,
  });

  const extractText = (event) => {
    const file = event.target.files[0];
    setFile(file); // Update file state

    // Extract the text from the PDF file
    pdfToText(file)
      .then((text) => {
        setPdfText(text); // Update PDF text state
      })
      .catch((error) =>
        console.error('Failed to extract text from PDF', error)
      );
  };

  const sendTextToChatbot = async () => {
    if (!pdfText) {
      alert('Please upload a PDF and extract text first!');
      return;
    }

    const prompts = {
      summary: 'Please summarize the following text: ',
      test: 'Please make a practice test of the following text: ',
      eli: 'Please ELI5 the following text: ',
      flashcards: 'Please generate flashcards for the following text: ',
    };

    const selectedPrompt = prompts[prompt] || 'Please process the following text:';

    if (prompt === 'flashcards') {
      await generateFlashcards(pdfText);
      return;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // Use the specific OpenAI model
        messages: [
          {
            role: 'system',
            content:
              'You are a professional teacher, passionate about helping students learn and succeed. Your explanations are clear, detailed, and easy to understand, always aiming to make even the most complex topics accessible to everyone. You are patient, empathetic, and always take the time to ensure students grasp the material fully, guiding them step by step. Your goal is to help students pass their exams with confidence, fostering a positive learning environment where no question is too small and every explanation is crafted with care.',
          },
          {
            role: 'user',
            content: `${selectedPrompt} \n\n${pdfText}`, // Pass the extracted text as the user input
          },
        ],
      });

      // Log the entire response to see what it returns
      console.log('Chatbot response:', completion);

      // Check if the response has a 'choices' array and the first message is present
      if (completion && completion.choices && completion.choices[0]) {
        setResponse(completion.choices[0].message.content);
      } else {
        console.error('Unexpected response format:', completion);
      }
    } catch (error) {
      console.error('Error sending text to chatbot:', error);
    }
  };

  const generateFlashcards = async (text) => {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', 
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant. You will not engage in any conversation with the user outside of generating flashcards. You will output the exact format as requested. You will not output anything else. Not even a "Sure thing" or anything similar. Just the precise format of the flashcards. Everything will be in plain text, so no markdown format.' 
          },
          {
            role: 'user',
            content: `Generate a list of key terms and definitions based on the following text. Each key term should be followed by its definition.\nIt should come in the following format: term: definition\n${text}`,
          },
        ],
      });

      const content = completion.choices[0].message.content;
      // Parse the content into flashcards
      const lines = content.split('\n').filter((line) => line.trim() !== '');
      const flashcardsArray = lines.map((line) => {
        const parts = line.split(':');
        const term = parts[0].trim();
        const definition = parts.slice(1).join(':').trim();
        return { term, definition };
      });
      setFlashcards(flashcardsArray);
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }
  };

  const handleNext = () => {
    if (flashcards.length > 0) {
      setCurrentCard((prev) => (prev + 1) % flashcards.length);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (flashcards.length > 0) {
      setCurrentCard(
        (prev) => (prev - 1 + flashcards.length) % flashcards.length
      );
      setIsFlipped(false);
    }
  };

  return (
    <div className="App">
      <div className="card">
        <h1>Upload a PDF</h1>
        <input
          className="file-input"
          type="file"
          accept="application/pdf"
          onChange={extractText}
        />
        <div className="dropdown">
          <label htmlFor="model-select">Choose a type of material: </label>
          <select
            id="model-select"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          >
            <option value="summary">Summary</option>
            <option value="test">Practice Test</option>
            <option value="eli">ELI5</option>
            <option value="flashcards">Flashcards</option>
          </select>
        </div>
        <button className="send-button" onClick={sendTextToChatbot}>
          Send to Chatbot
        </button>
        {response && (
          <div className="response-text">
            <h2>Chatbot Response:</h2>
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
        {flashcards.length > 0 && (
          <div>
            <div
              className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-content">
                <div className="flashcard-front">
                  <h3>{flashcards[currentCard].term}</h3>
                </div>
                <div className="flashcard-back">
                  <p>{flashcards[currentCard].definition}</p>
                </div>
              </div>
            </div>
            <div className="flashcard-buttons">
              <button onClick={handlePrevious}>Previous</button>
              <button onClick={handleNext}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
