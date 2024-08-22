'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Rating from '@mui/material/Rating';


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hi! I'm the Headstarter support assistant. How can I help you today?" }]
    }
  ]);

  //for green online indicator for profile image
  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));

  //for better looking star ratings
  const StyledRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
      color: '#45A29E',
    },
    '& .MuiRating-iconHover': {
      color: '#45A29E',
    },
  });
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  // Send message function
  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true)
    setMessage("");
    setMessages((messages) => [
      ...messages,
      {
        role: "user", parts: [{ text: message }]
      },
      {
        role: "model", parts: [{ text: ""}] // Placeholder message so that model can load its answer in
      }
    ])

    // Sends a POST request to the server
    try{
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify([...messages, { role: "user", parts: [{ text: message }] }])
    });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      const processText = async({done, value}) => {
        if (done) return result;

        const text = decoder.decode(value || new Uint8Array(), { stream: true}) // Decodes incoming input stream
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1)

          console.log(messages)
          console.log("lastMESSAGE: " + JSON.stringify(lastMessage)); // Add response to the placeholder message

          return [
            ...otherMessages,
            {...lastMessage, parts: [{ text: lastMessage.parts[0].text + text}]}
          ]
        })

        result += text;
        return reader.read().then(processText);
      };

      await reader.read().then(processText)

    } catch (error) {
      console.error("Error sending message", error);

      setMessages((messages) => [
        ...messages.slice(0, messages.length - 1), // Remove the placeholder
        {
          role: 'model',
          parts: [{ text: "An error occurred while sending the message." }], // Corrected the error message
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  //auto scrolling feature
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // UI
  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" bgcolor = '#0B0C10'>
      <Stack direction={'column'} width="500px" height="700px" border="1px"  p={2} spacing={3} sx={{ borderRadius: '16px',borderColor:'#66FCF1' }}>
      <Stack direction = {'row'} width="467px" height="70px" bgcolor = "#45A29E"  spacing={1} alignItems={'center'} margin ={0} padding = {2}  sx={{ borderRadius: '16px' }}>
        <Box width = "50px" height = "46px"><StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
        <Avatar src="/modelavatar.jpg" />
      </StyledBadge>
      </Box>
      <Typography color='#0b0c10' variant ='h5' >Headstarter Support Assistant</Typography>
      </Stack>
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'model' ? 'flex-start' : 'flex-end'}>
              <Stack direction={message.role === 'model' ? 'row' : 'row-reverse'}>
              <Avatar src={message.role==='model' ? '/modelavatar.jpg' : '/user.png'} />
              <Box bgcolor={ message.role === 'model' ? '#9ef7f1' : '#C5C6C7'} color="#1F2833" borderRadius={1} p={3}>
                <Markdown>{message.parts[0].text}</Markdown>
                {message.role === 'model' && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <StyledRating name="half-rating" defaultValue={2.5} precision={0.5} />
                    </Box>
                  )}
              </Box>
              </Stack>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField label="Message" fullWidth value={message} placeholder='Say "Hello" to begin chatting!' onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} sx = {{'& .MuiInputBase-input': { color: '#C5C6C7' }, '& .MuiInputLabel-root': { color: '#C5C6C7' }, '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: '#C5C6C7' }, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00d1c4', color: '#00d1c4' },'& .MuiInputLabel-root': { color: '#C5C6C7',},'& .MuiInputLabel-root.Mui-focused': {color: '#00d1c4',}}}></TextField>
          <Button variant="contained" onClick={sendMessage} disabled={isLoading} sx = {{bgcolor: '#00635d', color: '#C5C6C7', '&:hover': { backgroundColor: '#00d1c4',}}} ><SendIcon  /></Button>
        </Stack>
      </Stack>
    </Box>
  );
}