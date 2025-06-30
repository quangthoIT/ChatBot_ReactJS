import React, { use, useState, useRef, useEffect } from "react";
import logo from "../assets/Logo.png";
import user from "../assets/User.png";
import arrowDown from "../assets/arrowDown.png";
import { convertMarkdownToHTML } from "../utils/convertMarkdownToHTML";

const Chat = () => {
  //Set Messages
  const [messages, setMessages] = useState([]);
  //Text input state
  const [inputValue, setInputValue] = useState("");
  //Set is Loading state
  const [Loading, setIsLoading] = useState(false);
  //Set is ShowArrowDown state
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    console.log("showArrow:", showArrow);
  }, [showArrow]);

  const handleAIResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA-vCQ2ycLIlfsC-fr7po1XMmySfaotaFI`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${userMessage}`,
                  },
                ],
              },
            ],
          }),
        },
      );
      const data = await response.json();

      const aiMessage =
        data.candidates[0].content.parts[0].text ??
        "Sorry, I didn't understand that.";

      // Add animation to the AI response
      let index = 0;
      let tempText = "";
      const interval = setInterval(() => {
        tempText += aiMessage.charAt(index);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          if (newMessages[newMessages.length - 1].type === "bot") {
            newMessages[newMessages.length - 1].text = tempText;
          } else {
            newMessages.push({
              id: newMessages.length + 1,
              type: "bot",
              user: "masyGPT",
              text: tempText,
            });
          }
          return newMessages;
        });
        index++;
        if (index >= aiMessage.length) {
          clearInterval(interval);
        }
      }, 10);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          type: "bot",
          user: "masyGPT",
          text: aiMessage,
        },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          type: "bot",
          user: "masyGPT",
          text: "Error fetching response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  //Handle send message
  const handleSend = async () => {
    if (inputValue.trim() === "") return;
    const newMessage = {
      id: messages.length + 1,
      type: "user",
      user: "Me",
      text: inputValue,
    };
    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");
    // Simulate AI response
    await handleAIResponse(inputValue);
  };

  //Automatically scroll down when there is a new message
  useEffect(() => {
    if (chatMessages.current) {
      chatMessages.current.scrollTop = chatMessages.current.scrollHeight;
    }
  }, [messages]);

  //Make a reference to the chat messages container
  const chatMessages = useRef(null);

  //Handle arrowDown button display
  useEffect(() => {
    const container = chatMessages.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10;
      setShowArrow(!isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //Handle scroll to bottom
  const handleChatScroll = () => {
    if (chatMessages.current) {
      chatMessages.current.scrollTo({
        top: chatMessages.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className='chat-container'>
      {/* Sidebar */}
      <aside className='sidebar'>
        <h2 className='logo'>
          <img src={logo} alt='logo' />
          <span>masyGPT</span>
        </h2>
        <div className='channels'>
          <p className='channel active'>General</p>
          <p className='channel'>Tech Talk</p>
          <p className='channel'>Design</p>
        </div>
        <div className='user-profile'>
          <img src={user} alt='User Avatar' className='avatar' />
          <span className='username'>You</span>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className='chat-main'>
        <header className='chat-header'>
          <h2>General</h2>
          <p className='topic'>Chat about anything and everything !</p>
        </header>

        <section className='chat-messages' ref={chatMessages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.user === "Me" ? "my-message" : "other-message"
              }`}
            >
              <p className='message-user'>{message.user}</p>
              <p
                className='message-text'
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHTML(message.text),
                }}
              ></p>
            </div>
          ))}

          {/* Applying the loading state */}
          {Loading && (
            <div className='message-bubble other-message'>
              <p className='message-user'>masyGPT</p>
              <p className='message-text'>Generating response...</p>
            </div>
          )}

          {showArrow && (
            <button
              id='arrowDown'
              style={{ display: showArrow ? "flex" : "none" }}
              onClick={handleChatScroll}
            >
              <img src={arrowDown} alt='Arrow Down' />
            </button>
          )}
        </section>

        <footer className='chat-input'>
          <input
            type='text'
            placeholder='Type your message...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button disabled={!inputValue.trim()} onClick={handleSend}>
            Send
          </button>
        </footer>
        <p className='footer-message'>
          masyGPT is a free and open-source project.
        </p>
      </main>
    </div>
  );
};

export default Chat;
