import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaRobot } from 'react-icons/fa';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage = { type: 'user', content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      const assistantMessage = {
        type: 'assistant',
        content: data.reply || "Sorry, I couldn't understand that. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'assistant',
        content: 'An error occurred while processing your request. Please try again later.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out">
      <div className="p-6 bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-3xl font-semibold">Social Media Query Bot</h2>
      </div>
      <div ref={chatBoxRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg shadow-inner">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-transform duration-300 ease-in-out`}
          >
            {message.type === 'assistant' && (
              <FaRobot className="text-gray-500 text-xl" />
            )}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {message.content.split('*').map((line, i) => (
                <p key={i} className="my-1">
                  {line.trim() && `• ${line.trim()}`}
                </p>
              ))}
            </div>
            {message.type === 'user' && (
              <FaUser className="text-blue-500 text-xl" />
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse items-center space-x-2">
            <FaRobot className="text-gray-500 text-xl" />
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              Assistant is typing...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
