import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarGroup, Box, Button, List, ListItem, ListItemText, TextareaAutosize, CircularProgress } from '@mui/material';

// create variable to store chat messages
const messages = []

async function createCompletion(message) {
  const userMessage = { role: "user", content: message } 
  messages.push(userMessage)

  const DEFAULT_PARAMS = {
      model: "gpt-3.5-turbo",
      messages: messages,
      //temperature: 0,
      //"stream": false,
  };
  const params_ = { ...DEFAULT_PARAMS };

  const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_SECRET_KEY}`
      },
      body: JSON.stringify(params_)
  });
  const stream = result.body
  const output = await fetchStream(stream);
  const assistantMessage = output.choices[0].message  
  messages.push(assistantMessage)

  return assistantMessage
}

async function fetchStream(stream) {
  const reader = stream.getReader();
  let charsReceived = 0;
  const li = document.createElement("li");

  const result = await reader.read().then(
      function processText({ done, value }) {
          if (done) {
              console.log("Stream complete");
              return li.innerText;
          }
          charsReceived += value.length;
          const chunk = value;
          console.log(`Received ${charsReceived} characters so far. Current chunk = ${chunk}`);
          li.appendChild(document.createTextNode(chunk));
          return reader.read().then(processText);
      });
  const list = result.split(",")
  const numList = list.map((item) => {
      return parseInt(item)
  })
  const text = String.fromCharCode(...numList);
  const response = JSON.parse(text)
  return response
}

function ChatComponent({ onFlowchartDataReceived }) {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm Kendrik, Customer Identity Program Analyst. How can I help you today?",
      sender: 'server',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false); // New state variable for loading spinner
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      let chatGPTPrompt = inputMessage

  
      if ((inputMessage.includes('diagram') || inputMessage.includes('workflow') || inputMessage.includes('flowchart'))) {
        chatGPTPrompt = `create compact json compatible with gojs using the schema below to ${inputMessage} which could have multiple outcomes. response should only include json code is enclosed in \`\`\`. don't include description and the scheme provided below
        {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "nodeDataArray": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "key": {
                    "type": "integer"
                  },
                  "category": {
                    "type": "string",
                    "enum": ["Start", "Decision", "Action", "End"]
                  },
                  "text": {
                    "type": "string"
                  }
                },
                "required": ["key", "category", "text"]
              }
            },
            "linkDataArray": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "from": {
                    "type": "integer"
                  },
                  "to": {
                    "type": "integer"
                  },
                  "label": {
                    "type": "string"
                  }
                },
                "required": ["from", "to"]
              }
            }
          },
          "required": ["nodeDataArray", "linkDataArray"]
        }`
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage.trim(), sender: 'user' }
      ]);      
      setInputMessage('');
      
      setLoading(true); // Start displaying the spinner
      let umlString = (await createCompletion(chatGPTPrompt)).content;
      setLoading(false); // Stop displaying the spinner

      console.log(`GPT Reponse: ${umlString}`)

      // if umlstring has ```, extract the code between the ```
      if (umlString.includes('```')) {
        // start index of the code
        const start = umlString.indexOf('```') + 3;
        // end index of the code
        const end = umlString.lastIndexOf('```');
        // extract the code
        umlString = umlString.substring(start, end);
      }

      if (umlString.trim().startsWith('{')) {
        onFlowchartDataReceived(JSON.parse(umlString));
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Done!", sender: 'server' }
        ]);        
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: umlString, sender: 'server' }
        ]);       
      }

    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent form submission and page refresh
    sendMessage();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', paddingTop: '40px'  }}>
        <List>
          {messages.map((message, index) => (
          <ListItem
            key={index}
            sx={{
              marginBottom: 2,
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {message.sender === 'server' && (
              <AvatarGroup sx={{ alignItems: 'flex-start', mt: 0 }}>
                <Avatar
                  src="/img/Kendrick-digital-worker.jpeg"
                  sx={{ width: 44, height: 44 }}
                />
              </AvatarGroup>
            )}
            <ListItemText
              primary={message.text}
              primaryTypographyProps={{
                sx: {
                  ml: 1,
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  bgcolor:
                    message.sender === 'user' ? '#fff5e6' : '#f2f2f2',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  fontFamily: 'Avenir',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                },
              }}
            />
          </ListItem>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '48px' }}>
              <CircularProgress size={30} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
      <Box
        sx={{
          width: '400px',
        }}
      >
        <TextareaAutosize
          aria-label="chat input"
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          sx={{
            p: 1,
            borderRadius: 1,
            borderColor: 'divider',
            borderWidth: 1,
            borderStyle: 'solid',
            fontFamily: 'Avenir',
            width: '100%',
            maxWidth: '400px'
          }}
          style={{fontFamily: 'Avenir', width: '390px', height: '30px', paddingTop: '5px'}}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
      </Box>
        <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }} style={{fontFamily: 'Avenir'}}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default ChatComponent;
