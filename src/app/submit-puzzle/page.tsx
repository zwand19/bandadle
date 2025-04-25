'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FormState {
  title: string;
  questions: string[];
  answers: string[];
  extraWords: string[];
}

interface ValidationErrors {
  title: string;
  questions: string[];
  answers: string[];
  extraWords: string;
}

export default function SubmitPuzzle() {
  const [form, setForm] = useState<FormState>({
    title: '',
    questions: ['', '', '', ''],
    answers: ['', '', '', ''],
    extraWords: Array(20).fill('')
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({
    title: '',
    questions: ['', '', '', ''],
    answers: ['', '', '', ''],
    extraWords: ''
  });
  
  const [jsonOutput, setJsonOutput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      title: '',
      questions: ['', '', '', ''],
      answers: ['', '', '', ''],
      extraWords: ''
    };
    
    let isValid = true;
    
    // Check title
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    // Check questions
    form.questions.forEach((question, index) => {
      if (!question.trim()) {
        newErrors.questions[index] = 'Question is required';
        isValid = false;
      }
    });
    
    // Check answers
    const allWords = new Set<string>();
    const answerSets: Set<string>[] = [];
    
    form.answers.forEach((answer, index) => {
      const words = answer.trim().toLowerCase().split(/\s+/);
      const wordSet = new Set(words);
      answerSets.push(wordSet);
      
      // Check minimum word count
      if (words.length < (index === 3 ? 4 : 3) || answer.trim() === '') {
        newErrors.answers[index] = index === 3 
          ? 'Before, During & After answer must have at least 4 words' 
          : 'Answer must have at least 3 words';
        isValid = false;
      }
      
      // Add all words to the set
      words.forEach(word => allWords.add(word));
    });
    
    // Check for shared words between answers
    for (let i = 0; i < answerSets.length; i++) {
      for (let j = i + 1; j < answerSets.length; j++) {
        const intersection = new Set(
          [...answerSets[i]].filter(x => answerSets[j].has(x))
        );
        if (intersection.size > 0) {
          newErrors.answers[i] = `Answers cannot share words (shared with answer ${j+1})`;
          newErrors.answers[j] = `Answers cannot share words (shared with answer ${i+1})`;
          isValid = false;
        }
      }
    }
    
    // Check extra words
    const extraWordSet = new Set<string>();
    const filledExtraWords = form.extraWords.filter(word => word.trim() !== '');
    
    if (filledExtraWords.length < 15) {
      newErrors.extraWords = 'At least 15 extra words are required';
      isValid = false;
    }
    
    filledExtraWords.forEach(word => {
      const trimmedWord = word.trim().toLowerCase();
      
      // Check for spaces
      if (trimmedWord.includes(' ')) {
        newErrors.extraWords = 'Extra words cannot contain spaces';
        isValid = false;
      }
      
      // Check for duplicates
      if (extraWordSet.has(trimmedWord)) {
        newErrors.extraWords = 'Extra words cannot contain duplicates';
        isValid = false;
      }
      
      // Check if extra word is in any answer
      if (allWords.has(trimmedWord)) {
        newErrors.extraWords = 'Extra words cannot be used in answers';
        isValid = false;
      }
      
      extraWordSet.add(trimmedWord);
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate JSON
      const cluesData = {
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        title: form.title.trim(),
        clues: form.questions.map((question, index) => ({
          id: index,
          question: question.trim(),
          answer: form.answers[index].trim()
        })),
        extraWords: form.extraWords
          .filter(word => word.trim() !== '')
          .map(word => word.trim())
      };
      
      const jsonString = JSON.stringify(cluesData, null, 2);
      setJsonOutput(jsonString);
      
      // Create a simple popup
      const confirmed = window.confirm(
        "Your puzzle JSON has been generated! Choose OK to view and submit it."
      );
      
      if (confirmed) {
        // Open in a new tab/window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>Puzzle JSON - ${form.title}</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: rgb(242, 236, 215);
                    margin: 0;
                    padding: 20px;
                  }
                  .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                    color: rgb(31, 70, 57);
                    text-align: center;
                  }
                  pre {
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    overflow: auto;
                    white-space: pre-wrap;
                  }
                  .button-group {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                  }
                  button {
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    flex: 1;
                  }
                  .submit-btn {
                    background-color: rgb(31, 70, 57);
                    color: white;
                    border: none;
                  }
                  .copy-btn {
                    background-color: white;
                    color: rgb(31, 70, 57);
                    border: 1px solid rgb(31, 70, 57);
                  }
                  .result {
                    margin-top: 15px;
                    padding: 10px;
                    border-radius: 5px;
                  }
                  .success {
                    background-color: #d1fae5;
                    color: #065f46;
                  }
                  .error {
                    background-color: #fee2e2;
                    color: #b91c1c;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Puzzle JSON - ${form.title}</h1>
                  <p>Here's your puzzle JSON. You can copy it or submit it directly.</p>
                  <pre id="json-content">${jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                  <div class="button-group">
                    <button class="copy-btn" onclick="copyToClipboard()">Copy to Clipboard</button>
                    <button class="submit-btn" id="submit-btn" onclick="submitPuzzle()">Submit Puzzle</button>
                  </div>
                  <div id="result-container"></div>
                </div>
                
                <script>
                  function copyToClipboard() {
                    const jsonContent = document.getElementById('json-content').textContent;
                    navigator.clipboard.writeText(jsonContent)
                      .then(() => {
                        alert('Copied to clipboard!');
                      })
                      .catch(err => {
                        console.error('Failed to copy: ', err);
                      });
                  }
                  
                  function submitPuzzle() {
                    const submitBtn = document.getElementById('submit-btn');
                    const resultContainer = document.getElementById('result-container');
                    
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                    
                    // Create FormData
                    const formData = new FormData();
                    formData.append('puzzleTitle', '${form.title.replace(/'/g, "\\'")}');
                    formData.append('jsonData', document.getElementById('json-content').textContent);
                    
                    // Send data to FormSpree
                    fetch('https://formspree.io/f/mldbdzqp', {
                      method: 'POST',
                      body: formData,
                      headers: {
                        'Accept': 'application/json'
                      }
                    })
                    .then(response => {
                      if (response.ok) {
                        resultContainer.innerHTML = '<div class="result success">Your puzzle has been submitted successfully. Thank you for contributing!</div>';
                        submitBtn.textContent = 'Sent!';
                      } else {
                        return response.json().then(data => {
                          throw new Error(data.error || 'Failed to submit form');
                        });
                      }
                    })
                    .catch(error => {
                      resultContainer.innerHTML = '<div class="result error">' + error.message + '</div>';
                      submitBtn.disabled = false;
                      submitBtn.textContent = 'Submit Puzzle';
                    });
                  }
                </script>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          alert("Could not open new window. Your browser might be blocking pop-ups. Here's your JSON:\n\n" + jsonString);
        }
      }
    }
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof FormState | null,
    index: number | null
  ) => {
    const { value } = e.target;
    
    setForm(prev => {
      const newForm = { ...prev };
      
      if (field === 'title') {
        newForm.title = value;
      } else if (field === 'questions' && index !== null) {
        newForm.questions = [...prev.questions];
        newForm.questions[index] = value;
      } else if (field === 'answers' && index !== null) {
        newForm.answers = [...prev.answers];
        newForm.answers[index] = value;
      } else if (field === 'extraWords' && index !== null) {
        newForm.extraWords = [...prev.extraWords];
        newForm.extraWords[index] = value;
      }
      
      return newForm;
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 style={{ 
          color: 'rgb(31, 70, 57)', 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Submit a Puzzle
        </h1>
        
        <Link 
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            color: 'rgb(31, 70, 57)',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          &larr; Back to Game
        </Link>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="title"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'rgb(31, 70, 57)',
                fontWeight: 'bold'
              }}
            >
              Puzzle Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange(e, 'title', null)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: errors.title ? '1px solid #ef4444' : '1px solid #d1d5db'
              }}
            />
            {errors.title && (
              <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {errors.title}
              </p>
            )}
          </div>
          
          <h2 style={{ 
            color: 'rgb(31, 70, 57)', 
            fontSize: '1.25rem', 
            marginBottom: '1rem' 
          }}>
            Questions and Answers
          </h2>
          
          {form.questions.map((question, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                flexDirection: index === 3 ? 'column' : 'row'
              }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`question-${index}`}
                    style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'rgb(31, 70, 57)',
                      fontWeight: 'bold'
                    }}
                  >
                    Question {index === 3 ? '4 (Before, During & After)' : index + 1}
                  </label>
                  <textarea
                    id={`question-${index}`}
                    value={question}
                    onChange={(e) => handleInputChange(e, 'questions', index)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: errors.questions[index] ? '1px solid #ef4444' : '1px solid #d1d5db',
                      minHeight: '4rem',
                      resize: 'vertical'
                    }}
                  />
                  {errors.questions[index] && (
                    <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.questions[index]}
                    </p>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`answer-${index}`}
                    style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'rgb(31, 70, 57)',
                      fontWeight: 'bold'
                    }}
                  >
                    Answer {index === 3 ? '(min 4 words)' : '(min 3 words)'}
                  </label>
                  <input
                    id={`answer-${index}`}
                    type="text"
                    value={form.answers[index]}
                    onChange={(e) => handleInputChange(e, 'answers', index)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: errors.answers[index] ? '1px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {errors.answers[index] && (
                    <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.answers[index]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <h2 style={{ 
            color: 'rgb(31, 70, 57)', 
            fontSize: '1.25rem', 
            marginBottom: '1rem' 
          }}>
            Extra Words (fill at least 15, no spaces)
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            {form.extraWords.map((word, index) => (
              <input
                key={index}
                type="text"
                value={word}
                onChange={(e) => handleInputChange(e, 'extraWords', index)}
                placeholder={`Single word ${index + 1}`}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: errors.extraWords ? '1px solid #ef4444' : '1px solid #d1d5db'
                }}
              />
            ))}
          </div>
          
          {errors.extraWords && (
            <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {errors.extraWords}
            </p>
          )}
          
          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgb(31, 70, 57)',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Generate Puzzle JSON
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 